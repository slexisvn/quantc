import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { standardNormals } from '../../src/numerics/sampling'
import { stationaryBootstrapIndices, circularBlockBootstrapIndices, sharpeConfidenceInterval, whiteRealityCheck } from '../../src/alpha/bootstrap'
import type { Matrix } from '../../src/alpha/types'

describe('bootstrap index generators', () => {
  it('are deterministic per seed and stay in range', () => {
    const first = stationaryBootstrapIndices(50, { samples: 5, seed: 3 })
    const second = stationaryBootstrapIndices(50, { samples: 5, seed: 3 })
    const other = stationaryBootstrapIndices(50, { samples: 5, seed: 4 })
    expect(first).toEqual(second)
    expect(first).not.toEqual(other)
    for (const indices of first) for (const i of indices) expect(i >= 0 && i < 50).toBe(true)
    for (const indices of circularBlockBootstrapIndices(50, 7, 5, 3)) {
      expect(indices.length).toBe(50)
      for (const i of indices) expect(i >= 0 && i < 50).toBe(true)
    }
  })
})

describe('sharpe confidence interval', () => {
  it('covers the sample sharpe of an iid series', () => {
    const noise = standardNormals(500, 11)
    const returns = Array.from(noise, (z) => 0.05 + 0.1 * z)
    const interval = sharpeConfidenceInterval(returns, 0.95, { samples: 500, seed: 2 })
    expect(interval.lower).toBeLessThan(interval.point)
    expect(interval.upper).toBeGreaterThan(interval.point)
    expect(interval.lower).toBeGreaterThan(0)
    expect(interval.upper).toBeLessThan(1.2)
  })
})

describe('white reality check', () => {
  const t = 250
  const trials = 20

  function noiseTrials(seed: number): Matrix {
    const rng = new MersenneTwister(seed)
    return Array.from({ length: t }, () => Array.from({ length: trials }, () => (rng.nextDouble() - 0.5) * 0.02))
  }

  it('does not reject when every trial is noise', () => {
    const result = whiteRealityCheck(noiseTrials(5), { samples: 400, seed: 9 })
    expect(result.pValue).toBeGreaterThan(0.1)
  })

  it('rejects when one trial has a genuine positive mean', () => {
    const data = noiseTrials(5).map((row) => [...row, 0.005 + row[0] * 0.1])
    const result = whiteRealityCheck(data, { samples: 400, seed: 9 })
    expect(result.bestTrial).toBe(trials)
    expect(result.pValue).toBeLessThan(0.05)
  })

  it('the studentized variant agrees on the strong trial', () => {
    const data = noiseTrials(7).map((row) => [...row, 0.005 + row[1] * 0.1])
    const result = whiteRealityCheck(data, { samples: 400, seed: 9, studentized: true })
    expect(result.bestTrial).toBe(trials)
    expect(result.pValue).toBeLessThan(0.05)
  })
})
