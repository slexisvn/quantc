import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'
import { monotoneCubic } from '../../marketdata/interpolation'

export type TargetLocalVol = (spot: number, time: number) => number

export function conditionalVariance(spots: Float64Array, variances: Float64Array, bins: number): Float64Array {
  const paths = spots.length
  const order = Array.from({ length: paths }, (_, i) => i).sort((a, b) => spots[a] - spots[b])
  const conditional = new Float64Array(paths)
  const binSize = Math.ceil(paths / bins)
  for (let start = 0; start < paths; start += binSize) {
    const end = Math.min(start + binSize, paths)
    let sum = 0
    for (let k = start; k < end; k += 1) sum += variances[order[k]]
    const mean = sum / (end - start)
    for (let k = start; k < end; k += 1) conditional[order[k]] = mean
  }
  return conditional
}

export function kernelConditionalExpectation(spots: Float64Array, values: Float64Array, bandwidth: number): Float64Array {
  const n = spots.length
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => spots[a] - spots[b])
  const result = new Float64Array(n)
  let lo = 0
  for (let idx = 0; idx < n; idx += 1) {
    const center = spots[order[idx]]
    while (lo < n && spots[order[lo]] < center - bandwidth) lo += 1
    let sumWeight = 0
    let sumWeighted = 0
    for (let j = lo; j < n && spots[order[j]] <= center + bandwidth; j += 1) {
      const u = (spots[order[j]] - center) / bandwidth
      const kernel = 1 - u * u
      const weight = kernel * kernel
      sumWeight += weight
      sumWeighted += weight * values[order[j]]
    }
    result[order[idx]] = sumWeight > 0 ? sumWeighted / sumWeight : values[order[idx]]
  }
  return result
}

export interface LeverageSurfaceSpec {
  readonly spot: number
  readonly rate: number
  readonly maturity: number
  readonly initialVariance: number
  readonly meanReversion: number
  readonly longVariance: number
  readonly volOfVol: number
  readonly correlation: number
  readonly steps: number
  readonly paths: number
  readonly seed: number
  readonly gridPoints: number
  readonly estimator?: 'bins' | 'kernel'
  readonly bins?: number
  readonly bandwidth?: number
  readonly varianceFloor?: number
}

export interface LeverageSurface {
  leverage(time: number, spot: number): number
}

interface Slice {
  readonly time: number
  readonly interpolate: (spot: number) => number
}

function buildSurface(slices: Slice[]): LeverageSurface {
  const times = slices.map((s) => s.time)
  return {
    leverage(time, spot) {
      if (time <= times[0]) return slices[0].interpolate(spot)
      const last = slices.length - 1
      if (time >= times[last]) return slices[last].interpolate(spot)
      let i = 0
      while (i < last && times[i + 1] < time) i += 1
      const weight = (time - times[i]) / (times[i + 1] - times[i])
      return (1 - weight) * slices[i].interpolate(spot) + weight * slices[i + 1].interpolate(spot)
    },
  }
}

export function calibrateLeverageSurface(spec: LeverageSurfaceSpec, targetLocalVol: TargetLocalVol): LeverageSurface {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const floor = spec.varianceFloor ?? 1e-8
  const estimator = spec.estimator ?? 'bins'
  const bins = spec.bins ?? Math.max(1, Math.floor(Math.sqrt(spec.paths)))
  const generator = new MersenneTwister(spec.seed)

  const logSpot = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  const variance = new Float64Array(spec.paths).fill(spec.initialVariance)
  const spots = new Float64Array(spec.paths)
  const slices: Slice[] = []

  for (let step = 0; step < spec.steps; step += 1) {
    const time = step * dt
    for (let p = 0; p < spec.paths; p += 1) spots[p] = Math.exp(logSpot[p])
    const bandwidth = spec.bandwidth ?? kernelBandwidth(spots)
    const conditional = estimator === 'kernel' ? kernelConditionalExpectation(spots, variance, bandwidth) : conditionalVariance(spots, variance, bins)

    const order = Array.from({ length: spec.paths }, (_, i) => i).sort((a, b) => spots[a] - spots[b])
    const grid: number[] = []
    const leverageValues: number[] = []
    let previousNode = -Infinity
    for (let g = 0; g < spec.gridPoints; g += 1) {
      const position = spec.gridPoints === 1 ? 0 : g / (spec.gridPoints - 1)
      const index = Math.min(spec.paths - 1, Math.round(position * (spec.paths - 1)))
      const particle = order[index]
      const node = spots[particle]
      if (node <= previousNode) continue
      previousNode = node
      grid.push(node)
      leverageValues.push(targetLocalVol(node, time) / Math.sqrt(Math.max(conditional[particle], floor)))
    }
    const interpolate = grid.length >= 2 ? monotoneCubic(grid, leverageValues) : () => leverageValues[0]
    slices.push({ time, interpolate })

    for (let p = 0; p < spec.paths; p += 1) {
      const leverage = targetLocalVol(spots[p], time) / Math.sqrt(Math.max(conditional[p], floor))
      const localVol = leverage * Math.sqrt(Math.max(variance[p], 0))
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = spec.correlation * z1 + rhoComplement * inverseNormalCdf(generator.nextDouble())
      logSpot[p] += (spec.rate - 0.5 * localVol * localVol) * dt + localVol * sqrtDt * z1
      const positiveVariance = Math.max(variance[p], 0)
      variance[p] += spec.meanReversion * (spec.longVariance - positiveVariance) * dt + spec.volOfVol * Math.sqrt(positiveVariance) * sqrtDt * z2
    }
  }

  return buildSurface(slices)
}

function kernelBandwidth(spots: Float64Array): number {
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < spots.length; i += 1) {
    if (spots[i] < min) min = spots[i]
    if (spots[i] > max) max = spots[i]
  }
  const range = max - min
  return range > 0 ? range / 20 : 1
}

export interface SlvSurfacePriceResult {
  readonly price: number
  readonly standardError: number
}

export function priceSlvWithSurface(spec: LeverageSurfaceSpec, strike: number, surface: LeverageSurface): SlvSurfacePriceResult {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const generator = new MersenneTwister(spec.seed + 1)

  const logSpot = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  const variance = new Float64Array(spec.paths).fill(spec.initialVariance)

  for (let step = 0; step < spec.steps; step += 1) {
    const time = step * dt
    for (let p = 0; p < spec.paths; p += 1) {
      const spot = Math.exp(logSpot[p])
      const leverage = surface.leverage(time, spot)
      const localVol = leverage * Math.sqrt(Math.max(variance[p], 0))
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = spec.correlation * z1 + rhoComplement * inverseNormalCdf(generator.nextDouble())
      logSpot[p] += (spec.rate - 0.5 * localVol * localVol) * dt + localVol * sqrtDt * z1
      const positiveVariance = Math.max(variance[p], 0)
      variance[p] += spec.meanReversion * (spec.longVariance - positiveVariance) * dt + spec.volOfVol * Math.sqrt(positiveVariance) * sqrtDt * z2
    }
  }

  const discount = Math.exp(-spec.rate * spec.maturity)
  const estimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) estimator.push(discount * Math.max(Math.exp(logSpot[p]) - strike, 0))
  return { price: estimator.mean, standardError: estimator.standardError }
}
