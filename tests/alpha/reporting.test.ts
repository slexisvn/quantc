import { describe, it, expect } from 'vitest'
import { alphaBeta, trackingError, informationRatio } from '../../src/alpha/benchmark'
import { drawdownTable, underwater } from '../../src/alpha/analytics'
import { tearSheet } from '../../src/alpha/report'
import { backtest } from '../../src/alpha/backtest'
import { compose, type Matrix } from '../../src/alpha/types'
import { momentum } from '../../src/alpha/signals'
import { longShortRank } from '../../src/alpha/portfolio'

describe('benchmark-relative analytics', () => {
  it('recovers beta and alpha against a benchmark', () => {
    const benchmark = Array.from({ length: 100 }, (_, i) => 0.01 * Math.sin(i))
    const strategy = benchmark.map((b) => 0.0005 + 1.5 * b)
    const ab = alphaBeta(strategy, benchmark, 252)
    expect(ab.beta).toBeCloseTo(1.5, 6)
    expect(ab.alpha).toBeCloseTo(0.0005 * 252, 6)
    expect(trackingError(strategy, benchmark, 252)).toBeGreaterThan(0)
    expect(Number.isFinite(informationRatio(strategy, benchmark, 252))).toBe(true)
  })
})

describe('rolling analytics and tear sheet', () => {
  it('drawdown table and underwater curve identify the trough', () => {
    const episodes = drawdownTable([1, 1.2, 0.9, 1.5])
    expect(episodes.length).toBe(1)
    expect(episodes[0].depth).toBeCloseTo(0.25, 9)
    expect(Math.min(...underwater([1, 1.2, 0.9, 1.5]))).toBeCloseTo(-0.25, 9)
  })

  it('tear sheet aggregates metrics, drawdowns, exposure and rolling Sharpe', () => {
    const prices: Matrix = Array.from({ length: 80 }, (_, i) => [100 + i, 100 + 0.5 * i, 100 - 0.2 * i])
    const result = backtest(prices, compose(momentum(5), longShortRank(0.34)))
    const sheet = tearSheet(result, { rollingWindow: 20 })
    expect(sheet.rollingSharpe.length).toBe(result.portReturns.length)
    expect(Number.isFinite(sheet.exposure.grossMean)).toBe(true)
    expect(Array.isArray(sheet.drawdowns)).toBe(true)
  })
})
