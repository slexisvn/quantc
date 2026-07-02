import type { Matrix, Signal, Strategy } from './types'
import { forwardFilter, type GaussianHmm } from './hmm'
import { identityPortfolio } from './portfolio'
import { toReturns } from './util'

export type RegimeClassifier = (prices: Matrix) => Matrix

function crossSectionalMeanReturn(prices: Matrix): Matrix {
  return toReturns(prices).map((row) => [row.length === 0 ? 0 : row.reduce((s, x) => s + x, 0) / row.length])
}

export function hmmClassifier(model: GaussianHmm, featureFn: (prices: Matrix) => Matrix = crossSectionalMeanReturn): RegimeClassifier {
  return (prices) => forwardFilter(model, featureFn(prices))
}

export function regimeConditional(strategies: readonly Strategy[], classify: RegimeClassifier): Strategy {
  const signal: Signal = (prices) => {
    const probabilities = classify(prices)
    const weightSets = strategies.map((strategy) => strategy.portfolio(strategy.signal(prices)))
    return prices.map((row, i) =>
      row.map((_x, j) => {
        let blended = 0
        for (let k = 0; k < strategies.length; k += 1) blended += probabilities[i][k] * weightSets[k][i][j]
        return blended
      }),
    )
  }
  return { signal, portfolio: identityPortfolio() }
}

export function regimeScaled(base: Strategy, scales: readonly number[], classify: RegimeClassifier): Strategy {
  const signal: Signal = (prices) => {
    const probabilities = classify(prices)
    const weights = base.portfolio(base.signal(prices))
    return weights.map((row, i) => {
      let scale = 0
      for (let k = 0; k < scales.length; k += 1) scale += probabilities[i][k] * scales[k]
      return row.map((w) => w * scale)
    })
  }
  return { signal, portfolio: identityPortfolio() }
}
