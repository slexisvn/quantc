import { normalCdf } from '../../numerics/analytic/black-scholes'
import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface LmmSpec {
  readonly rateCount: number
  readonly accrual: number
  readonly initialForward: number
  readonly vol: number
  readonly capletIndex: number
  readonly strike: number
  readonly paths: number
  readonly seed: number
}

export interface LmmResult {
  readonly price: number
  readonly standardError: number
}

export function blackCaplet(initialForward: number, strike: number, vol: number, fixingTime: number, accrual: number, discount: number): number {
  const sqrtT = Math.sqrt(fixingTime)
  const d1 = (Math.log(initialForward / strike) + 0.5 * vol * vol * fixingTime) / (vol * sqrtT)
  const d2 = d1 - vol * sqrtT
  return discount * accrual * (initialForward * normalCdf(d1) - strike * normalCdf(d2))
}

export function priceLmmCaplet(spec: LmmSpec): LmmResult {
  const n = spec.rateCount
  const tau = spec.accrual
  const sigma = spec.vol
  const k = spec.capletIndex
  const generator = new MersenneTwister(spec.seed)

  const estimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) {
    const forwards = new Array<number>(n).fill(spec.initialForward)
    let bank = 1
    for (let m = 0; m <= k; m += 1) {
      bank *= 1 + tau * forwards[m]
      if (m < k) {
        const z = inverseNormalCdf(generator.nextDouble())
        for (let i = m + 1; i < n; i += 1) {
          let drift = 0
          for (let j = m + 1; j <= i; j += 1) drift += (tau * forwards[j]) / (1 + tau * forwards[j])
          drift *= sigma * sigma
          forwards[i] *= Math.exp((drift - 0.5 * sigma * sigma) * tau + sigma * Math.sqrt(tau) * z)
        }
      }
    }
    estimator.push((tau * Math.max(forwards[k] - spec.strike, 0)) / bank)
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
