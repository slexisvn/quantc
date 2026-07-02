import { describe, it, expect } from 'vitest'
import { computeKva, eadCapitalProfile, DEFAULT_CAPITAL_RATIO, type CapitalProfile } from '../../src/xva/kva'
import type { ExposureProfile } from '../../src/risk/exposure'

describe('KVA', () => {
  const times = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5)

  it('integrates a constant capital profile to the closed-form annuity', () => {
    const capital = times.map(() => 250)
    const profile: CapitalProfile = { times, capital }
    const hurdleRate = 0.1
    const discount = (t: number): number => Math.exp(-0.03 * t)
    let annuity = 0
    let previous = 0
    for (const t of times) {
      annuity += discount(t) * (t - previous)
      previous = t
    }
    expect(computeKva(profile, { hurdleRate, discount })).toBeCloseTo(hurdleRate * 250 * annuity, 9)
  })

  it('builds capital as capitalRatio·riskWeight·EPE', () => {
    const exposure = { times, epe: times.map(() => 100), ene: [], pfe: [], collateralEpe: [], eepe: 0, spotPaths: [], mtmPaths: [] } as unknown as ExposureProfile
    const profile = eadCapitalProfile(exposure, 1.5)
    expect(profile.capital[0]).toBeCloseTo(DEFAULT_CAPITAL_RATIO * 1.5 * 100, 12)
  })
})
