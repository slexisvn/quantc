import { adfStatistic, type DeterministicTrend } from './stationarity'

export function cusumEvents(series: readonly number[], threshold: number, drift = 0): number[] {
  const events: number[] = []
  let positive = 0
  let negative = 0
  for (let i = 1; i < series.length; i += 1) {
    const change = series[i] - series[i - 1] - drift
    positive = Math.max(0, positive + change)
    negative = Math.min(0, negative + change)
    if (positive > threshold || negative < -threshold) {
      events.push(i)
      positive = 0
      negative = 0
    }
  }
  return events
}

export function sadfStatistic(series: readonly number[], minWindow = 20, lags = 0, trend: DeterministicTrend = 'constant'): number {
  let supremum = -Infinity
  for (let end = minWindow; end <= series.length; end += 1) {
    supremum = Math.max(supremum, adfStatistic(series.slice(0, end), lags, trend))
  }
  return supremum
}

export function bsadfSeries(series: readonly number[], minWindow = 20, lags = 0, trend: DeterministicTrend = 'constant'): number[] {
  const out = new Array<number>(series.length).fill(0)
  for (let end = minWindow; end <= series.length; end += 1) {
    let supremum = -Infinity
    for (let start = 0; start + minWindow <= end; start += 1) {
      supremum = Math.max(supremum, adfStatistic(series.slice(start, end), lags, trend))
    }
    out[end - 1] = supremum
  }
  return out
}
