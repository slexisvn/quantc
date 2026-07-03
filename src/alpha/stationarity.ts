import { ols, withIntercept } from './regression'
import { chiSquareCdf } from '../numerics/stats/gamma'
import { meanStd } from './util'

export type DeterministicTrend = 'none' | 'constant' | 'trend'

export interface CriticalValues {
  readonly one: number
  readonly five: number
  readonly ten: number
}

export interface ResponseSurface {
  readonly limit: number
  readonly overT: number
  readonly overT2: number
}

export type SurfaceTriple = readonly [ResponseSurface, ResponseSurface, ResponseSurface]

export const ADF_RESPONSE_SURFACE: Readonly<Record<DeterministicTrend, SurfaceTriple>> = {
  none: [
    { limit: -2.56574, overT: -2.2358, overT2: -3.627 },
    { limit: -1.941, overT: -0.2686, overT2: -3.365 },
    { limit: -1.61682, overT: 0.2656, overT2: -2.714 },
  ],
  constant: [
    { limit: -3.43035, overT: -6.5393, overT2: -16.786 },
    { limit: -2.86154, overT: -2.8903, overT2: -4.234 },
    { limit: -2.56677, overT: -1.5384, overT2: -2.809 },
  ],
  trend: [
    { limit: -3.95877, overT: -9.0531, overT2: -28.428 },
    { limit: -3.41049, overT: -4.3904, overT2: -9.036 },
    { limit: -3.12705, overT: -2.5856, overT2: -3.925 },
  ],
}

export function surfaceCriticalValues(surface: SurfaceTriple, observations: number): CriticalValues {
  const evaluate = (s: ResponseSurface): number => s.limit + s.overT / observations + s.overT2 / (observations * observations)
  return { one: evaluate(surface[0]), five: evaluate(surface[1]), ten: evaluate(surface[2]) }
}

function deterministicTerms(trend: DeterministicTrend, index: number): number[] {
  if (trend === 'none') return []
  if (trend === 'constant') return [1]
  return [1, index]
}

export function adfStatistic(series: readonly number[], lags = 0, trend: DeterministicTrend = 'constant'): number {
  const t = series.length
  const design: number[][] = []
  const response: number[] = []
  for (let i = lags + 1; i < t; i += 1) {
    const row = [...deterministicTerms(trend, i), series[i - 1]]
    for (let k = 1; k <= lags; k += 1) row.push(series[i - k] - series[i - k - 1])
    design.push(row)
    response.push(series[i] - series[i - 1])
  }
  const levelPosition = trend === 'none' ? 0 : trend === 'constant' ? 1 : 2
  return ols(design, response).tStats[levelPosition]
}

export interface UnitRootTest {
  readonly statistic: number
  readonly criticalValues: CriticalValues
  readonly stationary: boolean
}

export function adfTest(series: readonly number[], lags = 0, trend: DeterministicTrend = 'constant', surface: Readonly<Record<DeterministicTrend, SurfaceTriple>> = ADF_RESPONSE_SURFACE): UnitRootTest {
  const statistic = adfStatistic(series, lags, trend)
  const criticalValues = surfaceCriticalValues(surface[trend], series.length - lags - 1)
  return { statistic, criticalValues, stationary: statistic < criticalValues.five }
}

export const KPSS_CRITICAL_VALUES: Readonly<Record<'constant' | 'trend', CriticalValues>> = {
  constant: { one: 0.739, five: 0.463, ten: 0.347 },
  trend: { one: 0.216, five: 0.146, ten: 0.119 },
}

export function kpssTest(series: readonly number[], trend: 'constant' | 'trend' = 'constant', lags?: number): UnitRootTest {
  const t = series.length
  const bandwidth = lags ?? Math.floor(4 * (t / 100) ** 0.25)
  const design = series.map((_, i) => (trend === 'trend' ? [1, i] : [1]))
  const residuals = ols(design, [...series]).residuals
  let cumulative = 0
  let numerator = 0
  for (const e of residuals) {
    cumulative += e
    numerator += cumulative * cumulative
  }
  const autocovariance = (lag: number): number => {
    let sum = 0
    for (let i = lag; i < t; i += 1) sum += residuals[i] * residuals[i - lag]
    return sum / t
  }
  let longRunVariance = autocovariance(0)
  for (let j = 1; j <= bandwidth; j += 1) longRunVariance += 2 * (1 - j / (bandwidth + 1)) * autocovariance(j)
  const statistic = numerator / (t * t * Math.max(longRunVariance, 1e-24))
  const criticalValues = KPSS_CRITICAL_VALUES[trend]
  return { statistic, criticalValues, stationary: statistic < criticalValues.five }
}

export interface LjungBoxResult {
  readonly statistic: number
  readonly pValue: number
  readonly degreesOfFreedom: number
}

export function ljungBox(series: readonly number[], lags = 10): LjungBoxResult {
  const t = series.length
  const { mean } = meanStd([...series])
  const centered = series.map((x) => x - mean)
  let variance = 0
  for (const x of centered) variance += x * x
  let statistic = 0
  for (let k = 1; k <= lags; k += 1) {
    let covariance = 0
    for (let i = k; i < t; i += 1) covariance += centered[i] * centered[i - k]
    const rho = variance < 1e-24 ? 0 : covariance / variance
    statistic += (rho * rho) / (t - k)
  }
  statistic *= t * (t + 2)
  return { statistic, pValue: 1 - chiSquareCdf(statistic, lags), degreesOfFreedom: lags }
}

export function hurstExponent(series: readonly number[], minWindow = 10, maxWindow?: number, growth = 1.5): number {
  const t = series.length
  const limit = maxWindow ?? Math.floor(t / 2)
  const logSizes: number[][] = []
  const logRescaledRanges: number[] = []
  for (let size = minWindow; size <= limit; size = Math.max(size + 1, Math.floor(size * growth))) {
    const chunks = Math.floor(t / size)
    let total = 0
    let counted = 0
    for (let c = 0; c < chunks; c += 1) {
      let mean = 0
      for (let i = 0; i < size; i += 1) mean += series[c * size + i]
      mean /= size
      let cumulative = 0
      let high = -Infinity
      let low = Infinity
      let sumSquares = 0
      for (let i = 0; i < size; i += 1) {
        const deviation = series[c * size + i] - mean
        cumulative += deviation
        high = Math.max(high, cumulative)
        low = Math.min(low, cumulative)
        sumSquares += deviation * deviation
      }
      const std = Math.sqrt(sumSquares / size)
      if (std > 1e-12) {
        total += (high - low) / std
        counted += 1
      }
    }
    if (counted > 0) {
      logSizes.push([Math.log(size)])
      logRescaledRanges.push(Math.log(total / counted))
    }
  }
  return ols(withIntercept(logSizes), logRescaledRanges).coefficients[1]
}

export function halfLife(series: readonly number[]): number {
  const design: number[][] = []
  const response: number[] = []
  for (let i = 1; i < series.length; i += 1) {
    design.push([1, series[i - 1]])
    response.push(series[i] - series[i - 1])
  }
  const beta = ols(design, response).coefficients[1]
  if (beta >= 0) return Infinity
  const phi = 1 + beta
  return phi <= 0 ? 0 : -Math.log(2) / Math.log(phi)
}
