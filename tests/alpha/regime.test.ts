import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { regimeConditional, regimeScaled, hmmClassifier, type RegimeClassifier } from '../../src/alpha/regime'
import { fitGaussianHmm, type GaussianHmm } from '../../src/alpha/hmm'
import { compose } from '../../src/alpha/types'
import type { Matrix } from '../../src/alpha/types'
import { momentum, meanReversion } from '../../src/alpha/signals'
import { equalWeight } from '../../src/alpha/portfolio'
import { backtest, walkForward } from '../../src/alpha/backtest'
import { toReturns } from '../../src/alpha/util'

const rng = new MersenneTwister(19)
const prices: Matrix = Array.from({ length: 120 }, (_, i) => Array.from({ length: 5 }, (_, j) => 100 * (1 + 0.001 * j) ** i * (1 + (rng.nextDouble() - 0.5) * 0.01)))
const base = compose(momentum(10), equalWeight())
const other = compose(meanReversion(10), equalWeight())

function constantClassifier(probabilities: number[]): RegimeClassifier {
  return (input) => input.map(() => probabilities.slice())
}

const handBuilt: GaussianHmm = {
  transition: [
    [0.9, 0.1],
    [0.1, 0.9],
  ],
  means: [[0.001], [-0.001]],
  variances: [[1e-4], [4e-4]],
  initial: [0.5, 0.5],
}

describe('regime wrappers', () => {
  it('a degenerate classifier reproduces the base strategy exactly', () => {
    const blended = backtest(prices, regimeConditional([base, other], constantClassifier([1, 0])))
    const direct = backtest(prices, base)
    blended.equity.forEach((level, i) => expect(level).toBeCloseTo(direct.equity[i], 12))
  })

  it('unit scales are a no-op', () => {
    const scaled = backtest(prices, regimeScaled(base, [1, 1], constantClassifier([0.3, 0.7])))
    const direct = backtest(prices, base)
    scaled.equity.forEach((level, i) => expect(level).toBeCloseTo(direct.equity[i], 12))
  })

  it('the hmm-driven strategy is causal end to end', () => {
    const strategy = regimeConditional([base, other], hmmClassifier(handBuilt))
    const cutoff = 80
    const perturbed = prices.map((row, i) => (i > cutoff ? row.map((x) => x * 2) : row.slice()))
    const baseWeights = strategy.portfolio(strategy.signal(prices))
    const shiftedWeights = strategy.portfolio(strategy.signal(perturbed))
    for (let i = 0; i <= cutoff - 1; i += 1) {
      for (let j = 0; j < 5; j += 1) expect(shiftedWeights[i][j]).toBe(baseWeights[i][j])
    }
  })

  it('fits on the train slice inside walk-forward and stays green', () => {
    const result = walkForward(prices, (train) => {
      const features = toReturns(train).map((row) => [row.reduce((s, x) => s + x, 0) / row.length])
      const fitted = fitGaussianHmm(features, 2, { seed: 7, maxIterations: 20 })
      return regimeScaled(base, [1, 0.5], hmmClassifier(fitted.model))
    })
    expect(result.portReturns.length).toBeGreaterThan(0)
    expect(Number.isFinite(result.metrics.sharpe)).toBe(true)
  })
})
