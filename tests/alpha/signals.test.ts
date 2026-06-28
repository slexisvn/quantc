import { describe, it, expect } from 'vitest'
import { momentum, meanReversion, zscore } from '../../src/alpha/signals'
import type { Matrix } from '../../src/alpha/types'

const trending: Matrix = Array.from({ length: 30 }, (_, i) => [100 + i])

describe('signals', () => {
  it('momentum is positive on a rising series past the lookback', () => {
    const score = momentum(5)(trending)
    expect(score[10][0]).toBeGreaterThan(0)
    expect(score[2][0]).toBe(0)
  })

  it('mean reversion is the negation of momentum', () => {
    const lookback = 5
    const mom = momentum(lookback)(trending)
    const rev = meanReversion(lookback)(trending)
    expect(rev[10][0]).toBeCloseTo(-mom[10][0], 12)
  })

  it('zscore is zero on a flat series and finite on a varying one', () => {
    const flat: Matrix = Array.from({ length: 20 }, () => [50])
    expect(zscore(5)(flat)[10][0]).toBe(0)
    expect(Number.isFinite(zscore(5)(trending)[10][0])).toBe(true)
  })
})
