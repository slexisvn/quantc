import { describe, it, expect } from 'vitest'
import { sharpe, maxDrawdown, hitRate, valueAtRisk } from '../../src/alpha/metrics'
import { historicalVar } from '../../src/risk/var'

describe('performance metrics', () => {
  it('max drawdown is the largest peak-to-trough decline', () => {
    expect(maxDrawdown([1, 1.2, 0.9, 1.5])).toBeCloseTo(0.25, 9)
  })

  it('hit rate is the fraction of positive returns', () => {
    expect(hitRate([0.1, -0.2, 0.3])).toBeCloseTo(2 / 3, 12)
  })

  it('sharpe annualizes mean over standard deviation', () => {
    const returns = [0.01, -0.01, 0.01, -0.01]
    expect(sharpe(returns, 1)).toBeCloseTo(0, 9)
    expect(Number.isFinite(sharpe([0.01, 0.02, 0.015], 252))).toBe(true)
  })

  it('value at risk ties to the underlying risk module', () => {
    const returns = [0.02, -0.03, 0.01, -0.05, 0.04]
    expect(valueAtRisk(returns, 0.8)).toBeCloseTo(historicalVar(Float64Array.from(returns), 0.8), 12)
  })
})
