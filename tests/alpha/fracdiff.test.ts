import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { ffdWeights, fixedWidthFracDiff, fracDiff } from '../../src/alpha/fracdiff'
import { tsDelta } from '../../src/alpha/ts-operators'

describe('fractional differentiation', () => {
  it('d = 0 is the identity weight', () => {
    expect(ffdWeights(0)).toEqual([1])
    const series = [1, 3, 2, 5]
    expect(fixedWidthFracDiff(series, 0)).toEqual(series)
  })

  it('d = 1 equals the first difference', () => {
    expect(ffdWeights(1)).toEqual([1, -1])
    const rng = new MersenneTwister(4)
    const m = Array.from({ length: 30 }, () => [rng.nextDouble()])
    const ffd = fracDiff(1)(m)
    const diff = tsDelta(1)(m)
    for (let i = 0; i < 30; i += 1) expect(ffd[i][0]).toBeCloseTo(diff[i][0], 12)
  })

  it('for 0 < d < 1 the tail weights are negative with decaying magnitude', () => {
    const weights = ffdWeights(0.5, 1e-4)
    expect(weights[0]).toBe(1)
    for (let k = 1; k < weights.length; k += 1) {
      expect(weights[k]).toBeLessThan(0)
      if (k > 1) expect(Math.abs(weights[k])).toBeLessThan(Math.abs(weights[k - 1]))
    }
  })

  it('is causal', () => {
    const rng = new MersenneTwister(8)
    const m = Array.from({ length: 40 }, () => [rng.nextDouble()])
    const perturbed = m.map((row, i) => (i > 25 ? [row[0] + 10] : row.slice()))
    const base = fracDiff(0.4)(m)
    const shifted = fracDiff(0.4)(perturbed)
    for (let i = 0; i <= 25; i += 1) expect(shifted[i][0]).toBe(base[i][0])
  })
})
