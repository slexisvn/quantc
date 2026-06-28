import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface SlvCalibrationSpec {
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
  readonly bins: number
}

export type TargetLocalVol = (spot: number, time: number) => number

export interface SlvCalibrationResult {
  readonly price: number
  readonly standardError: number
}

function conditionalVariance(spots: Float64Array, variances: Float64Array, bins: number): Float64Array {
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

export function calibrateAndPriceSlvCall(spec: SlvCalibrationSpec, strike: number, targetLocalVol: TargetLocalVol): SlvCalibrationResult {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const generator = new MersenneTwister(spec.seed)

  const logSpot = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  const variance = new Float64Array(spec.paths).fill(spec.initialVariance)
  const spots = new Float64Array(spec.paths)

  for (let step = 0; step < spec.steps; step += 1) {
    const time = step * dt
    for (let p = 0; p < spec.paths; p += 1) spots[p] = Math.exp(logSpot[p])
    const conditional = conditionalVariance(spots, variance, spec.bins)

    for (let p = 0; p < spec.paths; p += 1) {
      const leverage = targetLocalVol(spots[p], time) / Math.sqrt(Math.max(conditional[p], 1e-8))
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
