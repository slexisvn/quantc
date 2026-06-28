import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface RoughBergomiSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly maturity: number
  readonly forwardVariance: number
  readonly hurst: number
  readonly volOfVol: number
  readonly correlation: number
  readonly steps: number
  readonly paths: number
  readonly seed: number
}

export interface RoughBergomiResult {
  readonly price: number
  readonly standardError: number
}

export function priceRoughBergomiCall(spec: RoughBergomiSpec): RoughBergomiResult {
  const n = spec.steps
  const dt = spec.maturity / n
  const alpha = spec.hurst - 0.5
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)

  const kernel = new Float64Array(n + 1)
  for (let k = 1; k <= n; k += 1) kernel[k] = Math.pow(dt, alpha + 0.5) * (Math.pow(k, alpha + 1) - Math.pow(k - 1, alpha + 1)) / (alpha + 1)
  const orthogonalScale = Math.pow(dt, alpha + 0.5) * Math.sqrt(1 / (2 * alpha + 1) - 1 / ((alpha + 1) * (alpha + 1)))
  const scale = spec.volOfVol * Math.sqrt(2 * spec.hurst)

  const generator = new MersenneTwister(spec.seed)
  const discount = Math.exp(-spec.rate * spec.maturity)
  const estimator = new Welford()

  for (let p = 0; p < spec.paths; p += 1) {
    const driving = new Float64Array(n)
    const orthogonal = new Float64Array(n)
    const independent = new Float64Array(n)
    for (let i = 0; i < n; i += 1) {
      driving[i] = inverseNormalCdf(generator.nextDouble())
      orthogonal[i] = inverseNormalCdf(generator.nextDouble())
      independent[i] = inverseNormalCdf(generator.nextDouble())
    }

    let logSpot = Math.log(spec.spot)
    let variance = spec.forwardVariance
    for (let i = 1; i <= n; i += 1) {
      const spotShock = spec.correlation * (driving[i - 1] * sqrtDt) + rhoComplement * (independent[i - 1] * sqrtDt)
      logSpot += (spec.rate - 0.5 * variance) * dt + Math.sqrt(variance) * spotShock

      let volterra = orthogonalScale * orthogonal[i - 1]
      for (let k = 1; k <= i; k += 1) volterra += kernel[k] * driving[i - k]
      variance = spec.forwardVariance * Math.exp(scale * volterra - 0.5 * spec.volOfVol * spec.volOfVol * Math.pow(i * dt, 2 * spec.hurst))
    }
    estimator.push(discount * Math.max(Math.exp(logSpot) - spec.strike, 0))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
