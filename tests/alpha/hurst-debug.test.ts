import { describe, it, expect } from 'vitest'
import { hurstExponent } from '../../src/alpha/stationarity'
import { ffdWeights } from '../../src/alpha/fracdiff'

describe('hurst edge behavior', () => {
  it('a deterministic trend has an exponent near one', () => {
    const trend = Array.from({ length: 400 }, (_, i) => i * 0.5)
    expect(hurstExponent(trend, 10, 100)).toBeGreaterThan(0.9)
  })

  it('fractional integration weights decay slowly and stay positive', () => {
    const weights = ffdWeights(-0.35, 0.01)
    expect(weights[0]).toBe(1)
    for (let k = 1; k < weights.length; k += 1) {
      expect(weights[k]).toBeGreaterThan(0)
      if (k > 1) expect(weights[k]).toBeLessThan(weights[k - 1])
    }
    expect(weights.length).toBeGreaterThan(50)
  })
})
