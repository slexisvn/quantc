import { describe, it, expect } from 'vitest'
import { linearCost, squareRootImpact, borrowCost, combineCosts } from '../../src/alpha/costs'
import { eventBacktest } from '../../src/alpha/execution'
import { backtest } from '../../src/alpha/backtest'
import { compose, type Matrix } from '../../src/alpha/types'
import { momentum } from '../../src/alpha/signals'
import { equalWeight } from '../../src/alpha/portfolio'

describe('cost models', () => {
  it('linear, square-root and borrow costs compute correctly', () => {
    expect(linearCost(0.001)([0.5, -0.5], [])).toBeCloseTo(0.001, 12)
    expect(squareRootImpact(0.1)([0.25, 0], [])).toBeCloseTo(0.1 * 0.25 ** 1.5, 12)
    expect(borrowCost(0.0252, 252)([], [-1, 0.5])).toBeCloseTo(0.0001, 12)
    expect(combineCosts(linearCost(0.001), borrowCost(0.0252, 252))([1, 0], [-1, 0])).toBeCloseTo(0.001 + 0.0001, 12)
  })
})

describe('event-driven backtester', () => {
  const prices: Matrix = Array.from({ length: 50 }, (_, i) => [100 * Math.exp(0.005 * i), 100 * Math.exp(0.003 * i)])

  it('produces finite performance and costs reduce terminal equity', () => {
    const strategy = compose(momentum(5), equalWeight())
    const free = eventBacktest(prices, strategy, { rebalanceEvery: 5 })
    const charged = eventBacktest(prices, strategy, { rebalanceEvery: 5, costModel: linearCost(0.002), slippageBps: 5 })
    expect(Number.isFinite(free.metrics.sharpe)).toBe(true)
    expect(charged.equity[charged.equity.length - 1]).toBeLessThanOrEqual(free.equity[free.equity.length - 1])
  })

  it('matches the vectorized engine with daily rebalancing and no costs', () => {
    const strategy = compose(momentum(5), equalWeight())
    const event = eventBacktest(prices, strategy, { rebalanceEvery: 1 })
    const vector = backtest(prices, strategy)
    expect(event.equity[event.equity.length - 1]).toBeCloseTo(vector.equity[vector.equity.length - 1], 6)
  })
})
