import type { ExposureProfile } from '../risk/exposure'

export const DEFAULT_CAPITAL_RATIO = 0.08

export interface CapitalProfile {
  readonly times: number[]
  readonly capital: number[]
}

export interface KvaSpec {
  readonly hurdleRate: number
  readonly discount: (t: number) => number
}

export function computeKva(profile: CapitalProfile, spec: KvaSpec): number {
  let kva = 0
  let previous = 0
  for (let k = 0; k < profile.times.length; k += 1) {
    const time = profile.times[k]
    const dt = time - previous
    kva += spec.hurdleRate * profile.capital[k] * spec.discount(time) * dt
    previous = time
  }
  return kva
}

export function eadCapitalProfile(exposure: ExposureProfile, counterpartyRiskWeight: number, capitalRatio = DEFAULT_CAPITAL_RATIO): CapitalProfile {
  const capital = exposure.epe.map((positive) => capitalRatio * counterpartyRiskWeight * positive)
  return { times: exposure.times, capital }
}
