import { ols, withIntercept } from './regression'
import { meanStd } from './util'

export interface AlphaBeta {
  readonly alpha: number
  readonly beta: number
  readonly rSquared: number
}

export function alphaBeta(strategy: number[], benchmark: number[], periodsPerYear = 252): AlphaBeta {
  const design = withIntercept(benchmark.map((b) => [b]))
  const fit = ols(design, strategy)
  return { alpha: fit.coefficients[0] * periodsPerYear, beta: fit.coefficients[1], rSquared: fit.rSquared }
}

export function trackingError(strategy: number[], benchmark: number[], periodsPerYear = 252): number {
  const active = strategy.map((s, i) => s - benchmark[i])
  return meanStd(active).std * Math.sqrt(periodsPerYear)
}

export function informationRatio(strategy: number[], benchmark: number[], periodsPerYear = 252): number {
  const active = strategy.map((s, i) => s - benchmark[i])
  const { mean, std } = meanStd(active)
  return std < 1e-12 ? 0 : (mean / std) * Math.sqrt(periodsPerYear)
}
