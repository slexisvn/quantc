import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'
import { cholesky } from '../../numerics/linalg/cholesky'
import { normalCdf } from '../../numerics/analytic/black-scholes'

export interface LmmMultiSpec {
  readonly rateCount: number
  readonly accrual: number
  readonly initialForward: number
  readonly vols: number[]
  readonly correlationDecay: number
  readonly paths: number
  readonly seed: number
}

function factorMatrix(spec: LmmMultiSpec): number[][] {
  const n = spec.rateCount
  const correlation: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Math.exp(-spec.correlationDecay * Math.abs(i - j))))
  return cholesky(correlation)
}

function simulate(spec: LmmMultiSpec, expiryIndex: number, observe: (forwards: Float64Array, bank: number) => number): { price: number; standardError: number } {
  const n = spec.rateCount
  const tau = spec.accrual
  const factor = factorMatrix(spec)
  const generator = new MersenneTwister(spec.seed)
  const estimator = new Welford()

  for (let p = 0; p < spec.paths; p += 1) {
    const forwards = new Float64Array(n).fill(spec.initialForward)
    let bank = 1
    for (let m = 0; m < expiryIndex; m += 1) {
      bank *= 1 + tau * forwards[m]
      const shocks = new Array<number>(n)
      for (let q = 0; q < n; q += 1) shocks[q] = inverseNormalCdf(generator.nextDouble())
      for (let i = m + 1; i < n; i += 1) {
        let drift = 0
        for (let j = m + 1; j <= i; j += 1) {
          let rho = 0
          for (let q = 0; q <= Math.min(i, j); q += 1) rho += factor[i][q] * factor[j][q]
          drift += (tau * rho * spec.vols[j] * forwards[j]) / (1 + tau * forwards[j])
        }
        drift *= spec.vols[i]
        let diffusion = 0
        for (let q = 0; q <= i; q += 1) diffusion += factor[i][q] * shocks[q]
        forwards[i] *= Math.exp((drift - 0.5 * spec.vols[i] * spec.vols[i]) * tau + spec.vols[i] * Math.sqrt(tau) * diffusion)
      }
    }
    bank *= 1 + tau * forwards[expiryIndex]
    estimator.push(observe(forwards, bank))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}

export function lmmCaplet(spec: LmmMultiSpec, capletIndex: number, strike: number): { price: number; standardError: number } {
  const tau = spec.accrual
  return simulate(spec, capletIndex, (forwards, bank) => (tau * Math.max(forwards[capletIndex] - strike, 0)) / bank)
}

export function lmmSwaption(spec: LmmMultiSpec, expiryIndex: number, strike: number): { price: number; standardError: number } {
  const tau = spec.accrual
  const n = spec.rateCount
  return simulate(spec, expiryIndex, (forwards, bank) => {
    let bond = 1
    let annuity = 0
    for (let i = expiryIndex; i < n; i += 1) {
      bond /= 1 + tau * forwards[i]
      annuity += tau * bond
    }
    const swapRate = (1 - bond) / annuity
    return (annuity * Math.max(swapRate - strike, 0)) / bank
  })
}

export function blackCapletPrice(initialForward: number, strike: number, vol: number, fixingTime: number, accrual: number, discount: number): number {
  const sqrtT = Math.sqrt(fixingTime)
  const d1 = (Math.log(initialForward / strike) + 0.5 * vol * vol * fixingTime) / (vol * sqrtT)
  const d2 = d1 - vol * sqrtT
  return discount * accrual * (initialForward * normalCdf(d1) - strike * normalCdf(d2))
}
