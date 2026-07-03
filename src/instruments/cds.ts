import { HazardCurve } from '../models/credit/hazard-curve'

export interface CdsSpec {
  readonly maturity: number
  readonly frequency: number
  readonly recovery: number
  readonly discountRate: number
}

function schedule(spec: CdsSpec): number[] {
  const dates: number[] = []
  const periods = Math.round(spec.maturity / spec.frequency)
  for (let i = 1; i <= periods; i += 1) dates.push(i * spec.frequency)
  return dates
}

function integrateSchedule(spec: CdsSpec, term: (previous: number, date: number, discount: number) => number): number {
  let total = 0
  let previous = 0
  for (const date of schedule(spec)) {
    const discount = Math.exp(-spec.discountRate * date)
    total += term(previous, date, discount)
    previous = date
  }
  return total
}

export function premiumAnnuity(curve: HazardCurve, spec: CdsSpec): number {
  return integrateSchedule(spec, (previous, date, discount) => (date - previous) * discount * 0.5 * (curve.survival(previous) + curve.survival(date)))
}

export function protectionLeg(curve: HazardCurve, spec: CdsSpec): number {
  return integrateSchedule(spec, (previous, date, discount) => (1 - spec.recovery) * discount * (curve.survival(previous) - curve.survival(date)))
}

export function cdsParSpread(curve: HazardCurve, spec: CdsSpec): number {
  return protectionLeg(curve, spec) / premiumAnnuity(curve, spec)
}

export interface CdsQuote {
  readonly maturity: number
  readonly spread: number
}

export function bootstrapHazardCurve(quotes: readonly CdsQuote[], frequency: number, recovery: number, discountRate: number): HazardCurve {
  const times: number[] = []
  const hazards: number[] = []

  for (const quote of quotes) {
    times.push(quote.maturity)
    hazards.push(0.01)
    let low = 1e-6
    let high = 5
    for (let iteration = 0; iteration < 200; iteration += 1) {
      const mid = 0.5 * (low + high)
      hazards[hazards.length - 1] = mid
      const spec: CdsSpec = { maturity: quote.maturity, frequency, recovery, discountRate }
      const spread = cdsParSpread(new HazardCurve(times, hazards), spec)
      if (spread > quote.spread) high = mid
      else low = mid
    }
    hazards[hazards.length - 1] = 0.5 * (low + high)
  }

  return new HazardCurve(times, hazards)
}
