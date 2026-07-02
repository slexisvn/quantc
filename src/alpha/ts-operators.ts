import type { Matrix, Operator } from './types'
import { perColumn, column, rollingMeanStd } from './util'

function prefixSums(series: number[]): Float64Array {
  const prefix = new Float64Array(series.length + 1)
  for (let i = 0; i < series.length; i += 1) prefix[i + 1] = prefix[i] + series[i]
  return prefix
}

function afterWarmup(values: number[], window: number): number[] {
  return values.map((x, i) => (i < window - 1 ? 0 : x))
}

export function tsMean(window = 20): Operator {
  return (m) => perColumn(m, (series) => afterWarmup(rollingMeanStd(series, window).mean, window))
}

export function tsStd(window = 20): Operator {
  return (m) => perColumn(m, (series) => afterWarmup(rollingMeanStd(series, window).std, window))
}

export function tsZscore(window = 20): Operator {
  return (m) =>
    perColumn(m, (series) => {
      const { mean, std } = rollingMeanStd(series, window)
      return afterWarmup(series.map((x, i) => (std[i] > 1e-12 ? (x - mean[i]) / std[i] : 0)), window)
    })
}

export function tsSum(window = 20): Operator {
  return (m) =>
    perColumn(m, (series) => {
      const prefix = prefixSums(series)
      return series.map((_, i) => (i < window - 1 ? 0 : prefix[i + 1] - prefix[i + 1 - window]))
    })
}

export function tsProduct(window = 20): Operator {
  return (m) =>
    perColumn(m, (series) => {
      const out = new Array<number>(series.length).fill(0)
      let product = 1
      let zeroCount = 0
      for (let i = 0; i < series.length; i += 1) {
        if (series[i] === 0) zeroCount += 1
        else product *= series[i]
        if (i >= window) {
          if (series[i - window] === 0) zeroCount -= 1
          else product /= series[i - window]
        }
        if (i >= window - 1) out[i] = zeroCount > 0 ? 0 : product
      }
      return out
    })
}

function rollingArgExtreme(series: number[], window: number, replaces: (incoming: number, resident: number) => boolean): number[] {
  const indices = new Array<number>(series.length).fill(0)
  const deque = new Array<number>(series.length).fill(0)
  let head = 0
  let tail = 0
  for (let i = 0; i < series.length; i += 1) {
    while (tail > head && replaces(series[i], series[deque[tail - 1]])) tail -= 1
    deque[tail] = i
    tail += 1
    while (deque[head] <= i - window) head += 1
    indices[i] = deque[head]
  }
  return indices
}

function extremeOperator(window: number, replaces: (incoming: number, resident: number) => boolean, emit: (series: number[], extremeIndex: number, i: number) => number): Operator {
  return (m) => perColumn(m, (series) => rollingArgExtreme(series, window, replaces).map((extremeIndex, i) => (i < window - 1 ? 0 : emit(series, extremeIndex, i))))
}

export function tsMax(window = 20): Operator {
  return extremeOperator(window, (incoming, resident) => incoming >= resident, (series, extremeIndex) => series[extremeIndex])
}

export function tsMin(window = 20): Operator {
  return extremeOperator(window, (incoming, resident) => incoming <= resident, (series, extremeIndex) => series[extremeIndex])
}

export function tsArgmax(window = 20): Operator {
  return extremeOperator(window, (incoming, resident) => incoming >= resident, (_series, extremeIndex, i) => i - extremeIndex)
}

export function tsArgmin(window = 20): Operator {
  return extremeOperator(window, (incoming, resident) => incoming <= resident, (_series, extremeIndex, i) => i - extremeIndex)
}

function lowerBound(sorted: number[], value: number): number {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const mid = (low + high) >> 1
    if (sorted[mid] < value) low = mid + 1
    else high = mid
  }
  return low
}

export function tsRank(window = 20): Operator {
  return (m) =>
    perColumn(m, (series) => {
      const out = new Array<number>(series.length).fill(0)
      const sorted: number[] = []
      for (let i = 0; i < series.length; i += 1) {
        sorted.splice(lowerBound(sorted, series[i]), 0, series[i])
        if (i >= window) sorted.splice(lowerBound(sorted, series[i - window]), 1)
        if (i >= window - 1 && window > 1) out[i] = lowerBound(sorted, series[i]) / (window - 1)
      }
      return out
    })
}

export function tsDelay(lag = 1): Operator {
  return (m) => perColumn(m, (series) => series.map((_, i) => (i < lag ? 0 : series[i - lag])))
}

export function tsDelta(lag = 1): Operator {
  return (m) => perColumn(m, (series) => series.map((x, i) => (i < lag ? 0 : x - series[i - lag])))
}

export function decayLinear(window = 20): Operator {
  return (m) =>
    perColumn(m, (series) => {
      const out = new Array<number>(series.length).fill(0)
      const totalWeight = (window * (window + 1)) / 2
      let weighted = 0
      let plain = 0
      for (let i = 0; i < series.length; i += 1) {
        weighted += window * series[i] - plain
        plain += series[i]
        if (i >= window) plain -= series[i - window]
        if (i >= window - 1) out[i] = weighted / totalWeight
      }
      return out
    })
}

function rollingPairStats(x: number[], y: number[], window: number, emit: (cov: number, varX: number, varY: number) => number): number[] {
  const t = Math.min(x.length, y.length)
  const sumX = new Float64Array(t + 1)
  const sumY = new Float64Array(t + 1)
  const sumXY = new Float64Array(t + 1)
  const sumXX = new Float64Array(t + 1)
  const sumYY = new Float64Array(t + 1)
  for (let i = 0; i < t; i += 1) {
    sumX[i + 1] = sumX[i] + x[i]
    sumY[i + 1] = sumY[i] + y[i]
    sumXY[i + 1] = sumXY[i] + x[i] * y[i]
    sumXX[i + 1] = sumXX[i] + x[i] * x[i]
    sumYY[i + 1] = sumYY[i] + y[i] * y[i]
  }
  const out = new Array<number>(x.length).fill(0)
  for (let i = window - 1; i < t; i += 1) {
    const start = i + 1 - window
    const meanX = (sumX[i + 1] - sumX[start]) / window
    const meanY = (sumY[i + 1] - sumY[start]) / window
    const cov = (sumXY[i + 1] - sumXY[start]) / window - meanX * meanY
    const varX = (sumXX[i + 1] - sumXX[start]) / window - meanX * meanX
    const varY = (sumYY[i + 1] - sumYY[start]) / window - meanY * meanY
    out[i] = emit(cov, varX, varY)
  }
  return out
}

function pairOperator(other: Matrix, window: number, emit: (cov: number, varX: number, varY: number) => number): Operator {
  return (m) => perColumn(m, (series, j) => rollingPairStats(series, column(other, j), window, emit))
}

export function tsCov(other: Matrix, window = 20): Operator {
  return pairOperator(other, window, (cov) => cov)
}

export function tsCorr(other: Matrix, window = 20): Operator {
  return pairOperator(other, window, (cov, varX, varY) => (varX < 1e-24 || varY < 1e-24 ? 0 : cov / Math.sqrt(varX * varY)))
}
