import { describe, it, expect } from 'vitest'
import { equalWeight, crossSectional, longShortRank, meanVariance } from '../../src/alpha/portfolio'
import type { Matrix } from '../../src/alpha/types'

const score: Matrix = [[2, -1, 0.5, -3]]

describe('portfolio construction', () => {
  it('equal weight has unit gross exposure across active assets', () => {
    const w = equalWeight()(score)[0]
    expect(w.reduce((s, x) => s + Math.abs(x), 0)).toBeCloseTo(1, 12)
  })

  it('cross-sectional weights are dollar-neutral', () => {
    const w = crossSectional()(score)[0]
    expect(w.reduce((s, x) => s + x, 0)).toBeCloseTo(0, 12)
  })

  it('long-short rank is dollar-neutral and longs the top score', () => {
    const w = longShortRank(0.25)(score)[0]
    expect(w.reduce((s, x) => s + x, 0)).toBeCloseTo(0, 12)
    expect(w[0]).toBeGreaterThan(0)
    expect(w[3]).toBeLessThan(0)
  })

  it('mean-variance solves Σw ∝ Σ⁻¹μ and normalizes gross to one', () => {
    const cov: Matrix = [[0.04, 0], [0, 0.09]]
    const w = meanVariance([0.1, 0.1], cov)
    expect(w.reduce((s, x) => s + Math.abs(x), 0)).toBeCloseTo(1, 9)
    expect(w[0]).toBeGreaterThan(w[1])
  })
})
