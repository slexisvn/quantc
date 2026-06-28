import type { DiscountCurve } from '../marketdata/curve'
import { projectionForward } from '../marketdata/multi-curve'

export function depositDiscountFactor(rate: number, tenor: number): number {
  return 1 / (1 + rate * tenor)
}

export function depositRate(curve: DiscountCurve, tenor: number): number {
  return (1 / curve.discountFactor(tenor) - 1) / tenor
}

export function fraRate(curve: DiscountCurve, start: number, end: number): number {
  return projectionForward(curve, start, end)
}

export function futureConvexityAdjustment(vol: number, start: number, end: number): number {
  return 0.5 * vol * vol * start * end
}

export function futureRate(curve: DiscountCurve, vol: number, start: number, end: number): number {
  return fraRate(curve, start, end) + futureConvexityAdjustment(vol, start, end)
}
