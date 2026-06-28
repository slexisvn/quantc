import { describe, it, expect } from 'vitest'
import { backtest, walkForward } from '../../src/alpha/backtest'
import { compose, type Matrix, type Strategy } from '../../src/alpha/types'
import { momentum } from '../../src/alpha/signals'
import { equalWeight } from '../../src/alpha/portfolio'

const fixedWeights = (weights: Matrix): Strategy => ({ signal: (prices) => prices, portfolio: () => weights })

describe('vectorized backtester', () => {
  it('applies weights lagged by one period (look-ahead guard)', () => {
    const prices: Matrix = [[100], [110], [121], [108.9]]
    const weights: Matrix = [[0], [1], [0], [1]]
    const result = backtest(prices, fixedWeights(weights))
    expect(result.portReturns[0]).toBeCloseTo(0, 12)
    expect(result.portReturns[1]).toBeCloseTo(0.1, 9)
    expect(result.portReturns[2]).toBeCloseTo(0, 12)
    expect(result.equity[result.equity.length - 1]).toBeCloseTo(1.1, 9)
  })

  it('compounds a constant long position into the cumulative product of returns', () => {
    const prices: Matrix = [[100], [110], [99]]
    const result = backtest(prices, compose((p) => p.map(() => [1]), equalWeight()))
    expect(result.equity[0]).toBeCloseTo(1.1, 9)
    expect(result.equity[1]).toBeCloseTo(1.1 * 0.9, 9)
  })

  it('transaction cost lowers terminal equity monotonically', () => {
    const prices: Matrix = [[100], [110], [121], [110]]
    const weights: Matrix = [[1], [-1], [1], [-1]]
    const free = backtest(prices, fixedWeights(weights), { cost: 0 })
    const charged = backtest(prices, fixedWeights(weights), { cost: 0.01 })
    expect(charged.equity[charged.equity.length - 1]).toBeLessThan(free.equity[free.equity.length - 1])
  })

  it('walk-forward only evaluates out-of-sample segments', () => {
    const prices: Matrix = Array.from({ length: 40 }, (_, i) => [100 * Math.exp(0.01 * i)])
    const result = walkForward(prices, () => compose(momentum(5), equalWeight()), { folds: 4, minTrainFraction: 0.5 })
    expect(result.portReturns.length).toBeGreaterThan(0)
    expect(Number.isFinite(result.metrics.sharpe)).toBe(true)
  })
})
