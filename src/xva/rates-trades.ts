import type { DiscountCurve } from '../marketdata/curve'
import { hwBondLogA, hwBFactor } from '../models/rates/hull-white-affine'

export interface RatesTrade {
  mtm(shortRate: number, time: number): number
}

export interface HwSwapPeriod {
  readonly start: number
  readonly end: number
  readonly accrual: number
}

export interface HwSwapSpec {
  readonly curve: DiscountCurve
  readonly a: number
  readonly vol: number
  readonly fixedRate: number
  readonly periods: HwSwapPeriod[]
  readonly notional: number
  readonly payer: boolean
}

export function hwBond(curve: DiscountCurve, a: number, vol: number, t: number, maturity: number, shortRate: number): number {
  if (maturity <= t) return 1
  return Math.exp(hwBondLogA(curve, a, vol, t, maturity) - hwBFactor(a, maturity - t) * shortRate)
}

export function hwSwapMtm(spec: HwSwapSpec, t: number, shortRate: number): number {
  let firstStart = Infinity
  let lastEnd = -Infinity
  let fixedValue = 0
  let active = false
  for (const period of spec.periods) {
    if (period.end <= t) continue
    active = true
    firstStart = Math.min(firstStart, Math.max(period.start, t))
    lastEnd = Math.max(lastEnd, period.end)
    fixedValue += period.accrual * hwBond(spec.curve, spec.a, spec.vol, t, period.end, shortRate)
  }
  if (!active) return 0
  const floatValue = hwBond(spec.curve, spec.a, spec.vol, t, firstStart, shortRate) - hwBond(spec.curve, spec.a, spec.vol, t, lastEnd, shortRate)
  const payerValue = floatValue - spec.fixedRate * fixedValue
  return spec.notional * (spec.payer ? payerValue : -payerValue)
}

export function hwSwapTrade(spec: HwSwapSpec): RatesTrade {
  return { mtm: (shortRate, time) => hwSwapMtm(spec, time, shortRate) }
}
