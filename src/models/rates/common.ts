import { normalCdf } from '../../numerics/analytic/black-scholes'

export function affineBFactor(rate: number, tenor: number): number {
  return (1 - Math.exp(-rate * tenor)) / rate
}

export function affineCouponFlows(accruals: readonly number[], fixedRate: number): number[] {
  return accruals.map((accrual, i) => (i === accruals.length - 1 ? 1 + fixedRate * accrual : fixedRate * accrual))
}

export function blackCaplet(initialForward: number, strike: number, vol: number, fixingTime: number, accrual: number, discount: number): number {
  const sqrtT = Math.sqrt(fixingTime)
  const d1 = (Math.log(initialForward / strike) + 0.5 * vol * vol * fixingTime) / (vol * sqrtT)
  const d2 = d1 - vol * sqrtT
  return discount * accrual * (initialForward * normalCdf(d1) - strike * normalCdf(d2))
}
