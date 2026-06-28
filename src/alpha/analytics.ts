import { rollingMeanStd } from './util'

export function rollingSharpe(returns: number[], window = 60, periodsPerYear = 252): number[] {
  const { mean, std } = rollingMeanStd(returns, window)
  return mean.map((m, i) => (std[i] < 1e-12 ? 0 : (m / std[i]) * Math.sqrt(periodsPerYear)))
}

export function rollingVolatility(returns: number[], window = 60, periodsPerYear = 252): number[] {
  return rollingMeanStd(returns, window).std.map((s) => s * Math.sqrt(periodsPerYear))
}

export function underwater(equity: number[]): number[] {
  let peak = -Infinity
  return equity.map((value) => {
    if (value > peak) peak = value
    return peak > 0 ? value / peak - 1 : 0
  })
}

export interface DrawdownEpisode {
  readonly start: number
  readonly trough: number
  readonly recovery: number
  readonly depth: number
  readonly length: number
}

export function drawdownTable(equity: number[]): DrawdownEpisode[] {
  const episodes: DrawdownEpisode[] = []
  if (equity.length === 0) return episodes
  let peak = equity[0]
  let peakIndex = 0
  let troughIndex = 0
  let troughValue = Infinity
  let inDrawdown = false
  for (let i = 0; i < equity.length; i += 1) {
    if (equity[i] >= peak) {
      if (inDrawdown) {
        episodes.push({ start: peakIndex, trough: troughIndex, recovery: i, depth: 1 - troughValue / peak, length: i - peakIndex })
        inDrawdown = false
      }
      peak = equity[i]
      peakIndex = i
    } else if (!inDrawdown) {
      inDrawdown = true
      troughValue = equity[i]
      troughIndex = i
    } else if (equity[i] < troughValue) {
      troughValue = equity[i]
      troughIndex = i
    }
  }
  if (inDrawdown) episodes.push({ start: peakIndex, trough: troughIndex, recovery: -1, depth: 1 - troughValue / peak, length: equity.length - 1 - peakIndex })
  return episodes
}
