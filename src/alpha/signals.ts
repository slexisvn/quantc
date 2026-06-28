import type { Signal, SignalFactory } from './types'
import { perColumn, rollingMeanStd, mapMatrix } from './util'

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
      return series.map((x, i) => (std[i] > 1e-12 ? (x - mean[i]) / std[i] : 0))
    })
}

export const SIGNALS: Record<string, SignalFactory> = {
  momentum: (params = {}) => momentum(params.lookback),
  meanReversion: (params = {}) => meanReversion(params.lookback),
  zscore: (params = {}) => zscore(params.window),
}
