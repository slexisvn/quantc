import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { pipe, toReturnsOperator } from '../../src/alpha/operators'
import { tsSum } from '../../src/alpha/ts-operators'
import { csRank, csDemean, csScale } from '../../src/alpha/cs-operators'
import { neutralizeScores } from '../../src/alpha/riskmodel'
import { nestedClusteredOptimization } from '../../src/alpha/nco'
import { turnoverAwareOptimize } from '../../src/alpha/allocation'
import { sampleCovariance } from '../../src/alpha/covariance'
import { compose } from '../../src/alpha/types'
import type { Matrix, Signal } from '../../src/alpha/types'
import { identityPortfolio } from '../../src/alpha/portfolio'
import { ewmaVolTarget } from '../../src/alpha/sizing'
import { backtest } from '../../src/alpha/backtest'
import { tearSheet } from '../../src/alpha/report'
import { deflatedSharpe, sharpePerPeriod } from '../../src/alpha/overfit'
import { combinatorialPurgedCv } from '../../src/alpha/cv'
import { toReturns } from '../../src/alpha/util'

const T = 150
const N = 8
const rng = new MersenneTwister(71)
const prices: Matrix = []
const level = Array.from({ length: N }, () => 100)
for (let i = 0; i < T; i += 1) {
  prices.push(level.slice())
  for (let j = 0; j < N; j += 1) level[j] *= 1 + 0.0004 * j + (rng.nextDouble() - 0.5) * 0.02
}
const characteristics: Matrix[] = Array.from({ length: T }, () => Array.from({ length: N }, () => [rng.nextDouble() * 2 - 1]))

describe('end-to-end research pipeline', () => {
  const alpha = pipe(toReturnsOperator(), tsSum(10), csRank(), csDemean(), csScale())

  const neutralizedSignal: Signal = (input) => neutralizeScores(alpha(input), characteristics)

  it('composed alpha -> neutralization -> vol targeting -> backtest produces a sane tear sheet', () => {
    const strategy = compose(
      (input) => ewmaVolTarget(neutralizedSignal(input), toReturns(input), 0.1),
      identityPortfolio(),
    )
    const result = backtest(prices, strategy, { cost: 0.0005 })
    const sheet = tearSheet(result)
    expect(result.equity.length).toBe(T - 1)
    expect(Number.isFinite(result.metrics.sharpe)).toBe(true)
    expect(result.metrics.maxDrawdown).toBeGreaterThanOrEqual(0)
    expect(result.metrics.maxDrawdown).toBeLessThan(1)
    expect(sheet.rollingSharpe.length).toBe(result.portReturns.length)
    expect(Number.isFinite(deflatedSharpe(result.portReturns, [sharpePerPeriod(result.portReturns), 0.01, -0.02]))).toBe(true)
  })

  it('weights are causal through the whole pipeline', () => {
    const strategy = compose(neutralizedSignal, identityPortfolio())
    const cutoff = 100
    const perturbed = prices.map((row, i) => (i > cutoff ? row.map((x) => x * 3) : row.slice()))
    const baseWeights = strategy.portfolio(strategy.signal(prices))
    const shiftedWeights = strategy.portfolio(strategy.signal(perturbed))
    for (let i = 0; i <= cutoff - 1; i += 1) {
      for (let j = 0; j < N; j += 1) expect(shiftedWeights[i][j]).toBe(baseWeights[i][j])
    }
  })

  it('portfolio construction chains nco and cost-aware rebalancing on estimated covariance', () => {
    const covariance = sampleCovariance(toReturns(prices).slice(1))
    const target = nestedClusteredOptimization(covariance, { denoise: true, observations: T - 1 })
    const rebalanced = turnoverAwareOptimize(
      Array.from({ length: N }, (_, j) => 0.0004 * j),
      covariance,
      target,
      { costPerTurnover: 0.01, seed: 3 },
    )
    expect(target.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 8)
    rebalanced.forEach((w) => expect(Number.isFinite(w)).toBe(true))
  })

  it('cpcv splits the sample without leakage for model selection', () => {
    const eventEnds = Array.from({ length: T }, (_, i) => Math.min(i + 5, T - 1))
    const folds = combinatorialPurgedCv(eventEnds, 6, 2)
    expect(folds.length).toBe(15)
    for (const fold of folds) {
      const testSet = new Set(fold.test)
      for (const i of fold.train) {
        for (let s = i; s <= eventEnds[i]; s += 1) expect(testSet.has(s)).toBe(false)
      }
    }
  })
})
