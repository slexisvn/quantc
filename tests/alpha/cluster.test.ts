import { describe, it, expect } from 'vitest'
import { singleLinkage, orderFromLinkage, clustersAtCount, correlationDistance } from '../../src/alpha/cluster'
import { hierarchicalRiskParity } from '../../src/alpha/allocation'
import { correlationFromCovariance } from '../../src/alpha/covariance'

const vols = [0.2, 0.25, 0.1, 0.15, 0.3]
const corr = [
  [1, 0.8, 0.1, 0.1, 0.1],
  [0.8, 1, 0.1, 0.1, 0.1],
  [0.1, 0.1, 1, 0.6, 0.6],
  [0.1, 0.1, 0.6, 1, 0.6],
  [0.1, 0.1, 0.6, 0.6, 1],
]
const cov = corr.map((row, i) => row.map((c, j) => c * vols[i] * vols[j]))

describe('cluster extraction', () => {
  it('hrp reproduces the pre-refactor weights exactly', () => {
    const pinned = [0.13619866550059354, 0.08716714592037991, 0.5646707091633533, 0.16957078353253863, 0.04239269588313465]
    const weights = hierarchicalRiskParity(cov)
    weights.forEach((w, i) => expect(w).toBeCloseTo(pinned[i], 14))
    expect(weights.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
  })

  it('orderFromLinkage covers every asset exactly once', () => {
    const order = orderFromLinkage(singleLinkage(correlationDistance(correlationFromCovariance(cov))), cov.length)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
  })

  it('clustersAtCount recovers the two correlation blocks', () => {
    const steps = singleLinkage(correlationDistance(correlationFromCovariance(cov)))
    const groups = clustersAtCount(steps, cov.length, 2)
    expect(groups.length).toBe(2)
    const normalized = groups.map((g) => [...g].sort((a, b) => a - b).join(',')).sort()
    expect(normalized).toEqual(['0,1', '2,3,4'])
  })
})
