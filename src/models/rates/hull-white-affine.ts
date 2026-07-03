import type { DiscountCurve } from '../../marketdata/curve'
import { affineBFactor } from './common'

export function hwBFactor(a: number, tenor: number): number {
  return affineBFactor(a, tenor)
}

export function hwInstantaneousForward(curve: DiscountCurve, t: number): number {
  const h = 1e-4
  const left = Math.max(t - h, 1e-8)
  const right = t + h
  return (Math.log(curve.discountFactor(left)) - Math.log(curve.discountFactor(right))) / (right - left)
}

export function hwAlpha(curve: DiscountCurve, a: number, vol: number, t: number): number {
  const factor = 1 - Math.exp(-a * t)
  return hwInstantaneousForward(curve, t) + ((vol * vol) / (2 * a * a)) * factor * factor
}

export function hwDecay(a: number, dt: number): number {
  return Math.exp(-a * dt)
}

export function hwStepStd(a: number, vol: number, dt: number): number {
  return vol * Math.sqrt((1 - Math.exp(-2 * a * dt)) / (2 * a))
}

export function hwBondLogA(curve: DiscountCurve, a: number, vol: number, t: number, maturity: number): number {
  const b = hwBFactor(a, maturity - t)
  const ratio = curve.discountFactor(maturity) / curve.discountFactor(t)
  return Math.log(ratio) + b * hwInstantaneousForward(curve, t) - ((vol * vol) / (4 * a)) * (1 - Math.exp(-2 * a * t)) * b * b
}
