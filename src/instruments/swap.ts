import type { DiscountCurve } from '../marketdata/curve'

export interface VanillaSwap {
  readonly times: number[]
  readonly accruals: number[]
  readonly fixedRate: number
}

export function fixedLegValue(swap: VanillaSwap, curve: DiscountCurve): number {
  let value = 0
  for (let i = 0; i < swap.times.length; i += 1) value += swap.fixedRate * swap.accruals[i] * curve.discountFactor(swap.times[i])
  return value
}

export function floatLegValue(swap: VanillaSwap, curve: DiscountCurve): number {
  return 1 - curve.discountFactor(swap.times[swap.times.length - 1])
}

export function swapValue(swap: VanillaSwap, curve: DiscountCurve): number {
  return floatLegValue(swap, curve) - fixedLegValue(swap, curve)
}

export function parSwapRate(times: number[], accruals: number[], curve: DiscountCurve): number {
  let annuity = 0
  for (let i = 0; i < times.length; i += 1) annuity += accruals[i] * curve.discountFactor(times[i])
  return (1 - curve.discountFactor(times[times.length - 1])) / annuity
}
