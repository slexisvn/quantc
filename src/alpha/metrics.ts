import { historicalVar, historicalExpectedShortfall } from '../risk/var'
import { meanStd } from './util'

export function sharpe(returns: number[], periodsPerYear = 252): number {
  const { mean, std } = meanStd(returns)
  return std < 1e-12 ? 0 : (mean / std) * Math.sqrt(periodsPerYear)
}

export function sortino(returns: number[], periodsPerYear = 252): number {
  if (returns.length === 0) return 0
  const { mean } = meanStd(returns)
  let downsideSquared = 0
  for (const r of returns) if (r < 0) downsideSquared += r * r
  const downside = Math.sqrt(downsideSquared / returns.length)
  return downside < 1e-12 ? 0 : (mean / downside) * Math.sqrt(periodsPerYear)
}

export function maxDrawdown(equity: number[]): number {
  let peak = -Infinity
  let worst = 0
  for (const value of equity) {
    if (value > peak) peak = value
    const drawdown = peak > 0 ? 1 - value / peak : 0
    if (drawdown > worst) worst = drawdown
  }
  return worst
}

export function calmar(returns: number[], equity: number[], periodsPerYear = 252): number {
  const drawdown = maxDrawdown(equity)
  const annualized = meanStd(returns).mean * periodsPerYear
  return drawdown < 1e-12 ? 0 : annualized / drawdown
}

export function hitRate(returns: number[]): number {
  if (returns.length === 0) return 0
  let wins = 0
  for (const r of returns) if (r > 0) wins += 1
  return wins / returns.length
}

export function summarizePerformance(portReturns: number[], equity: number[], turnover: number, periodsPerYear = 252): Record<string, number> {
  return {
    sharpe: sharpe(portReturns, periodsPerYear),
    sortino: sortino(portReturns, periodsPerYear),
    maxDrawdown: maxDrawdown(equity),
    calmar: calmar(portReturns, equity, periodsPerYear),
    hitRate: hitRate(portReturns),
    turnover,
  }
}

export function valueAtRisk(returns: number[], confidence = 0.95): number {
  return historicalVar(Float64Array.from(returns), confidence)
}

export function expectedShortfall(returns: number[], confidence = 0.95): number {
  return historicalExpectedShortfall(Float64Array.from(returns), confidence)
}
