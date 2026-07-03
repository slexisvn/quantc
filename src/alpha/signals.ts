import type { Signal, SignalFactory } from './types'
import { perColumn, rollingMeanStd, mapMatrix, standardize } from './util'
import { pipe, toReturnsOperator } from './operators'
import { tsSum, tsZscore, decayLinear } from './ts-operators'
import { csRank, csDemean, csScale } from './cs-operators'

export function momentum(lookback = 20): Signal {
  return (prices) =>
    perColumn(prices, (series) => {
      const t = series.length
      const out = new Array<number>(t).fill(0)
      for (let i = lookback; i < t; i += 1) out[i] = series[i - lookback] === 0 ? 0 : series[i] / series[i - lookback] - 1
      return out
    })
}

export function meanReversion(lookback = 20): Signal {
  const trend = momentum(lookback)
  return (prices) => mapMatrix(trend(prices), (x) => -x)
}

export function zscore(window = 20): Signal {
  return (prices) =>
    perColumn(prices, (series) => {
      const { mean, std } = rollingMeanStd(series, window)
      return series.map((x, i) => standardize(x, mean[i], std[i]))
    })
}

export function rankMomentum(lookback = 20): Signal {
  return pipe(toReturnsOperator(), tsSum(lookback), csRank(), csDemean(), csScale())
}

export function decayedZscore(window = 20, decay = 10): Signal {
  return pipe(tsZscore(window), decayLinear(decay))
}

export const SIGNALS: Record<string, SignalFactory> = {
  momentum: (params = {}) => momentum(params.lookback),
  meanReversion: (params = {}) => meanReversion(params.lookback),
  zscore: (params = {}) => zscore(params.window),
  rankMomentum: (params = {}) => rankMomentum(params.lookback),
  decayedZscore: (params = {}) => decayedZscore(params.window, params.decay),
}
