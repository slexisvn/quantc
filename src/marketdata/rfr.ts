import { DiscountCurve } from './curve'
import { projectionForward, annuity, type FloatingSwap } from './multi-curve'

export interface RfrFixings {
  readonly times: number[]
  readonly rates: number[]
}

export interface CompoundingConventions {
  readonly lookbackDays: number
  readonly lockoutDays: number
  readonly observationShift: boolean
}

const NO_CONVENTIONS: CompoundingConventions = { lookbackDays: 0, lockoutDays: 0, observationShift: false }

export function compoundedRate(fixings: RfrFixings, start: number, end: number, conventions: CompoundingConventions = NO_CONVENTIONS): number {
  const indices: number[] = []
  for (let i = 0; i < fixings.times.length - 1; i += 1) {
    if (fixings.times[i] >= start - 1e-12 && fixings.times[i] < end - 1e-12) indices.push(i)
  }
  if (indices.length === 0) return 0
  const lockoutStart = indices.length - conventions.lockoutDays
  let product = 1
  let totalAccrual = 0
  for (let position = 0; position < indices.length; position += 1) {
    const i = indices[position]
    let rateIndex = i - conventions.lookbackDays
    let accrual = fixings.times[i + 1] - fixings.times[i]
    if (conventions.observationShift) {
      const shifted = Math.max(0, i - conventions.lookbackDays)
      accrual = fixings.times[shifted + 1] - fixings.times[shifted]
      rateIndex = shifted
    }
    if (conventions.lockoutDays > 0 && position >= lockoutStart) rateIndex = indices[Math.max(0, lockoutStart - 1)]
    rateIndex = Math.min(Math.max(rateIndex, 0), fixings.rates.length - 1)
    product *= 1 + fixings.rates[rateIndex] * accrual
    totalAccrual += fixings.times[i + 1] - fixings.times[i]
  }
  return (product - 1) / totalAccrual
}

export function forwardCompoundedRate(projection: DiscountCurve, start: number, end: number): number {
  return projectionForward(projection, start, end)
}

export interface RfrPeriod {
  readonly start: number
  readonly end: number
  readonly accrual: number
}

export function rfrFloatingLegValue(periods: readonly RfrPeriod[], fixings: RfrFixings, discount: DiscountCurve, projection: DiscountCurve, valuationDate: number, conventions: CompoundingConventions = NO_CONVENTIONS): number {
  let value = 0
  for (const period of periods) {
    const rate = period.end <= valuationDate ? compoundedRate(fixings, period.start, period.end, conventions) : forwardCompoundedRate(projection, Math.max(period.start, valuationDate), period.end)
    value += period.accrual * rate * discount.discountFactor(period.end)
  }
  return value
}

export function rfrParSwapRate(periods: readonly RfrPeriod[], fixings: RfrFixings, discount: DiscountCurve, projection: DiscountCurve, valuationDate: number, conventions: CompoundingConventions = NO_CONVENTIONS): number {
  const swap: FloatingSwap = { times: periods.map((p) => p.end), accruals: periods.map((p) => p.accrual), fixedRate: 0 }
  return rfrFloatingLegValue(periods, fixings, discount, projection, valuationDate, conventions) / annuity(swap, discount)
}

export function rfrFutureRate(projection: DiscountCurve, start: number, end: number): number {
  return forwardCompoundedRate(projection, start, end)
}
