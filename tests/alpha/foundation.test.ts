import { describe, it, expect } from 'vitest'
import { ols, withIntercept } from '../../src/alpha/regression'
import { sampleCovariance, correlationFromCovariance, ledoitWolf } from '../../src/alpha/covariance'
import { moments, pearson, spearman, percentile } from '../../src/alpha/stats'
import { matMul, transpose, invert, identity } from '../../src/alpha/linalg'

describe('regression', () => {
  it('recovers exact coefficients of a linear relationship', () => {
    const x = [[1], [2], [3], [4], [5]]
    const y = x.map((r) => 2 + 3 * r[0])
    const fit = ols(withIntercept(x), y)
    expect(fit.coefficients[0]).toBeCloseTo(2, 9)
    expect(fit.coefficients[1]).toBeCloseTo(3, 9)
    expect(fit.rSquared).toBeCloseTo(1, 9)
  })
})

describe('linear algebra', () => {
  it('inverts and multiplies consistently', () => {
    const a = [[4, 1], [2, 3]]
    const product = matMul(a, invert(a))
    const id = identity(2)
    for (let i = 0; i < 2; i += 1) for (let j = 0; j < 2; j += 1) expect(product[i][j]).toBeCloseTo(id[i][j], 9)
    expect(transpose(a)[0][1]).toBe(2)
  })
})

describe('covariance', () => {
  const returns = [[0.01, 0.02], [-0.01, -0.02], [0.02, 0.04], [0.0, 0.0], [0.015, 0.03]]
  it('is symmetric and yields unit correlation for collinear assets', () => {
    const cov = sampleCovariance(returns)
    expect(cov[0][1]).toBeCloseTo(cov[1][0], 12)
    expect(correlationFromCovariance(cov)[0][1]).toBeCloseTo(1, 6)
  })
  it('Ledoit-Wolf shrinkage lies in [0,1]', () => {
    const lw = ledoitWolf(returns)
    expect(lw.shrinkage).toBeGreaterThanOrEqual(0)
    expect(lw.shrinkage).toBeLessThanOrEqual(1)
  })
})

describe('statistics', () => {
  it('moments, correlation and percentile match known values', () => {
    expect(pearson([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 12)
    expect(spearman([1, 2, 3], [10, 20, 30])).toBeCloseTo(1, 12)
    expect(moments([1, 1, 1, 1]).variance).toBeCloseTo(0, 12)
    expect(percentile([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5, 9)
  })
})
