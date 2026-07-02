import { describe, it, expect } from 'vitest'
import { nestedClusteredOptimization } from '../../src/alpha/nco'
import { minVariance, turnoverAwareOptimize, ALLOCATORS } from '../../src/alpha/allocation'
import { dot } from '../../src/alpha/linalg'

const blockDiagonal = [
  [0.04, 0.024, 0, 0, 0],
  [0.024, 0.09, 0, 0, 0],
  [0, 0, 0.01, 0.006, 0.004],
  [0, 0, 0.006, 0.0225, 0.005],
  [0, 0, 0.004, 0.005, 0.0625],
]

describe('nested clustered optimization', () => {
  it('matches global minimum variance on a block-diagonal covariance', () => {
    const nco = nestedClusteredOptimization(blockDiagonal, { clusters: 2 })
    const direct = minVariance(blockDiagonal)
    expect(nco.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 10)
    nco.forEach((w, i) => expect(w).toBeCloseTo(direct[i], 6))
  })

  it('is deterministic and registered as an allocator', () => {
    const first = nestedClusteredOptimization(blockDiagonal, { clusters: 2 })
    const second = ALLOCATORS.nco(blockDiagonal, { clusters: 2 })
    first.forEach((w, i) => expect(w).toBe(second[i]))
    expect(Object.keys(ALLOCATORS)).toContain('hrp')
    expect(Object.keys(ALLOCATORS)).toContain('riskParity')
  })
})

describe('turnover-aware optimization', () => {
  const expectedReturns = [0.1, 0.05, 0.02]
  const covariance = [
    [0.04, 0, 0],
    [0, 0.04, 0],
    [0, 0, 0.04],
  ]
  const previous = [0.2, 0.3, 0.1]

  it('zero cost with slack constraints recovers the unconstrained mean-variance solution', () => {
    const weights = turnoverAwareOptimize(expectedReturns, covariance, previous, { costPerTurnover: 0, maxWeight: 5, maxLeverage: 10, seed: 1 })
    const ideal = expectedReturns.map((mu) => mu / 0.04)
    const cosine = dot(weights, ideal) / (Math.sqrt(dot(weights, weights)) * Math.sqrt(dot(ideal, ideal)))
    expect(cosine).toBeGreaterThan(0.99)
    weights.forEach((w, i) => expect(w).toBeCloseTo(ideal[i], 1))
  })

  it('prohibitive cost keeps the previous weights', () => {
    const weights = turnoverAwareOptimize(expectedReturns, covariance, previous, { costPerTurnover: 10, seed: 1 })
    weights.forEach((w, i) => expect(Math.abs(w - previous[i])).toBeLessThan(0.05))
  })

  it('turnover falls monotonically as the cost rises', () => {
    const turnoverAt = (cost: number): number => {
      const weights = turnoverAwareOptimize(expectedReturns, covariance, previous, { costPerTurnover: cost, seed: 1 })
      return weights.reduce((s, w, i) => s + Math.abs(w - previous[i]), 0)
    }
    const low = turnoverAt(0)
    const mid = turnoverAt(0.05)
    const high = turnoverAt(10)
    expect(mid).toBeLessThanOrEqual(low + 1e-9)
    expect(high).toBeLessThanOrEqual(mid + 1e-9)
  })

  it('is reproducible per seed', () => {
    const first = turnoverAwareOptimize(expectedReturns, covariance, previous, { costPerTurnover: 0.01, seed: 7 })
    const second = turnoverAwareOptimize(expectedReturns, covariance, previous, { costPerTurnover: 0.01, seed: 7 })
    expect(first).toEqual(second)
  })
})
