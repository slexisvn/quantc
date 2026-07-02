import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { crossSectionalFactorModel, neutralizeScores, standardizeExposures } from '../../src/alpha/riskmodel'
import { pearson } from '../../src/alpha/stats'
import type { Matrix } from '../../src/alpha/types'

const T = 120
const N = 25
const K = 2
const rng = new MersenneTwister(17)
const characteristics: Matrix[] = Array.from({ length: T - 1 }, () => Array.from({ length: N }, () => Array.from({ length: K }, () => rng.nextDouble() * 2 - 1)))
const trueFactors: Matrix = Array.from({ length: T - 1 }, () => Array.from({ length: K }, () => (rng.nextDouble() - 0.5) * 0.04))
const noiseScale = 0.001
const returns: Matrix = [Array.from({ length: N }, () => 0)]
for (let p = 0; p < T - 1; p += 1) {
  returns.push(
    Array.from({ length: N }, (_, j) => {
      let value = (rng.nextDouble() - 0.5) * noiseScale
      for (let f = 0; f < K; f += 1) value += characteristics[p][j][f] * trueFactors[p][f]
      return value
    }),
  )
}

describe('cross-sectional factor model', () => {
  const model = crossSectionalFactorModel(returns, characteristics, { standardize: false, intercept: false })

  it('recovers the true factor return series', () => {
    for (let f = 0; f < K; f += 1) {
      const estimated = model.factorReturns.map((row) => row[f])
      const truth = trueFactors.map((row) => row[f])
      expect(pearson(estimated, truth)).toBeGreaterThan(0.99)
    }
  })

  it('specific variances are near the injected noise level', () => {
    const noiseVariance = (noiseScale * noiseScale) / 12
    for (const variance of model.specificVariances) {
      expect(variance).toBeGreaterThan(0)
      expect(variance).toBeLessThan(noiseVariance * 5)
    }
  })

  it('uses exposures at t against returns at t+1 only', () => {
    const perturbed = returns.map((row, i) => (i === T - 1 ? row.map((x) => x + 1) : row))
    const other = crossSectionalFactorModel(perturbed, characteristics, { standardize: false, intercept: false })
    for (let p = 0; p < T - 3; p += 1) {
      for (let f = 0; f < K; f += 1) expect(other.factorReturns[p][f]).toBe(model.factorReturns[p][f])
    }
    expect(other.factorReturns[T - 2][0]).not.toBe(model.factorReturns[T - 2][0])
  })

  it('reports per-period r-squared near one for a low-noise factor structure', () => {
    const average = model.rSquared.reduce((s, x) => s + x, 0) / model.rSquared.length
    expect(average).toBeGreaterThan(0.9)
  })
})

describe('score neutralization', () => {
  it('residual scores are orthogonal to every exposure each period', () => {
    const scores: Matrix = Array.from({ length: T - 1 }, (_, p) => Array.from({ length: N }, (_, j) => characteristics[p][j][0] * 0.5 + rng.nextDouble()))
    const neutral = neutralizeScores(scores, characteristics)
    for (let p = 0; p < 5; p += 1) {
      const standardized = standardizeExposures(characteristics[p])
      for (let f = 0; f < K; f += 1) {
        let inner = 0
        for (let j = 0; j < N; j += 1) inner += neutral[p][j] * standardized[j][f]
        expect(Math.abs(inner)).toBeLessThan(1e-8)
      }
      expect(Math.abs(neutral[p].reduce((s, x) => s + x, 0))).toBeLessThan(1e-8)
    }
  })
})

describe('standardize exposures', () => {
  it('each characteristic column has zero mean and unit variance', () => {
    const standardized = standardizeExposures(characteristics[0])
    for (let f = 0; f < K; f += 1) {
      const column = standardized.map((row) => row[f])
      const mean = column.reduce((s, x) => s + x, 0) / N
      const variance = column.reduce((s, x) => s + (x - mean) * (x - mean), 0) / (N - 1)
      expect(mean).toBeCloseTo(0, 10)
      expect(variance).toBeCloseTo(1, 10)
    }
  })
})
