export type Matrix = number[][]
export type Signal = (prices: Matrix) => Matrix
export type Operator = (m: Matrix) => Matrix
export type Portfolio = (score: Matrix) => Matrix

export interface Strategy {
  readonly signal: Signal
  readonly portfolio: Portfolio
}

export interface BacktestConfig {
  readonly cost: number
  readonly maxLeverage: number
  readonly start: number
  readonly periodsPerYear: number
}

export interface BacktestResult {
  readonly equity: number[]
  readonly weights: Matrix
  readonly portReturns: number[]
  readonly turnover: number
  readonly metrics: Record<string, number>
}

export type SignalFactory = (params?: Record<string, number>) => Signal
export type OperatorFactory = (params?: Record<string, number>) => Operator
export type PortfolioFactory = (params?: Record<string, number>) => Portfolio

export function compose(signal: Signal, portfolio: Portfolio): Strategy {
  return { signal, portfolio }
}
