import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'
import { cholesky } from '../../numerics/linalg/cholesky'

export interface JyStochasticSpec {
  readonly nominalForward: number
  readonly realForward: number
  readonly nominalMeanReversion: number
  readonly nominalVol: number
  readonly realMeanReversion: number
  readonly realVol: number
  readonly cpiVol: number
  readonly corrNominalReal: number
  readonly corrNominalCpi: number
  readonly corrRealCpi: number
  readonly indexLevel: number
  readonly strike: number
  readonly maturity: number
  readonly steps: number
  readonly paths: number
  readonly seed: number
}

export interface JyResult {
  readonly price: number
  readonly standardError: number
  readonly forwardIndexRatio: number
  readonly realBond: number
}

function nominalAlpha(spec: JyStochasticSpec, t: number): number {
  const a = spec.nominalMeanReversion
  return spec.nominalForward + (spec.nominalVol * spec.nominalVol) / (2 * a * a) * (1 - Math.exp(-a * t)) * (1 - Math.exp(-a * t))
}

function realAlpha(spec: JyStochasticSpec, t: number): number {
  const a = spec.realMeanReversion
  return spec.realForward + (spec.realVol * spec.realVol) / (2 * a * a) * (1 - Math.exp(-a * t)) * (1 - Math.exp(-a * t))
}

export function jyInflationCallMc(spec: JyStochasticSpec): JyResult {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const factor = cholesky([
    [1, spec.corrNominalReal, spec.corrNominalCpi],
    [spec.corrNominalReal, 1, spec.corrRealCpi],
    [spec.corrNominalCpi, spec.corrRealCpi, 1],
  ])
  const quantoDrift = spec.corrRealCpi * spec.realVol * spec.cpiVol
  const generator = new MersenneTwister(spec.seed)

  const priceEstimator = new Welford()
  const ratioEstimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) {
    let xNominal = 0
    let xReal = 0
    let logIndex = Math.log(spec.indexLevel)
    let integral = 0
    for (let step = 0; step < spec.steps; step += 1) {
      const time = step * dt
      const nominal = xNominal + nominalAlpha(spec, time)
      const real = xReal + realAlpha(spec, time)
      integral += nominal * dt

      const z0 = inverseNormalCdf(generator.nextDouble())
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = inverseNormalCdf(generator.nextDouble())
      const dWn = factor[0][0] * z0
      const dWr = factor[1][0] * z0 + factor[1][1] * z1
      const dWi = factor[2][0] * z0 + factor[2][1] * z1 + factor[2][2] * z2

      xNominal += -spec.nominalMeanReversion * xNominal * dt + spec.nominalVol * sqrtDt * dWn
      xReal += (-spec.realMeanReversion * xReal - quantoDrift) * dt + spec.realVol * sqrtDt * dWr
      logIndex += (nominal - real - 0.5 * spec.cpiVol * spec.cpiVol) * dt + spec.cpiVol * sqrtDt * dWi
    }
    const discount = Math.exp(-integral)
    const ratio = Math.exp(logIndex) / spec.indexLevel
    priceEstimator.push(discount * Math.max(ratio - spec.strike, 0))
    ratioEstimator.push(discount * ratio)
  }

  return { price: priceEstimator.mean, standardError: priceEstimator.standardError, forwardIndexRatio: ratioEstimator.mean, realBond: Math.exp(-spec.realForward * spec.maturity) }
}
