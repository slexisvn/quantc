import type { Matrix, Strategy, BacktestConfig, BacktestResult } from './types'
import { rows, cols, toReturns, capLeverage } from './util'
import { summarizePerformance } from './metrics'
import { linearCost, type CostModel } from './costs'

function computeWeights(prices: Matrix, strategy: Strategy, maxLeverage: number): Matrix {
  return capLeverage(strategy.portfolio(strategy.signal(prices)), maxLeverage)
}

interface Track {
  readonly portReturns: number[]
  readonly equity: number[]
  readonly turnover: number
}

function evaluate(returns: Matrix, weights: Matrix, costModel: CostModel, start: number, end: number): Track {
  const n = cols(returns)
  const portReturns: number[] = []
  const equity: number[] = []
  let level = 1
  let turnover = 0
  for (let i = Math.max(1, start + 1); i < end; i += 1) {
    const current = weights[i - 1]
    const trade = new Array<number>(n).fill(0)
    let gross = 0
    for (let j = 0; j < n; j += 1) {
      gross += current[j] * returns[i][j]
      trade[j] = current[j] - (i - 2 >= 0 ? weights[i - 2][j] : 0)
    }
    let traded = 0
    for (let j = 0; j < n; j += 1) traded += Math.abs(trade[j])
    const net = gross - costModel(trade, current)
    turnover += traded
    level *= 1 + net
    portReturns.push(net)
    equity.push(level)
  }
  return { portReturns, equity, turnover }
}

export interface VectorBacktestConfig extends BacktestConfig {
  readonly costModel: CostModel
}

export function backtest(prices: Matrix, strategy: Strategy, config: Partial<VectorBacktestConfig> = {}): BacktestResult {
  const { cost = 0, maxLeverage = Infinity, start = 0, periodsPerYear = 252, costModel } = config
  const model = costModel ?? linearCost(cost)
  const returns = toReturns(prices)
  const weights = computeWeights(prices, strategy, maxLeverage)
  const track = evaluate(returns, weights, model, start, rows(prices))
  return { equity: track.equity, weights, portReturns: track.portReturns, turnover: track.turnover, metrics: summarizePerformance(track.portReturns, track.equity, track.turnover, periodsPerYear) }
}

export interface WalkForwardConfig extends VectorBacktestConfig {
  readonly folds: number
  readonly minTrainFraction: number
}

export function walkForward(prices: Matrix, makeStrategy: (train: Matrix) => Strategy, config: Partial<WalkForwardConfig> = {}): BacktestResult {
  const { cost = 0, maxLeverage = Infinity, folds = 4, minTrainFraction = 0.5, periodsPerYear = 252, costModel } = config
  const model = costModel ?? linearCost(cost)
  const t = rows(prices)
  const returns = toReturns(prices)
  const trainEnd = Math.max(1, Math.floor(t * minTrainFraction))
  const segment = Math.max(1, Math.floor((t - trainEnd) / folds))
  const portReturns: number[] = []
  let turnover = 0
  for (let f = 0; f < folds; f += 1) {
    const segStart = trainEnd + f * segment
    if (segStart >= t) break
    const segEnd = f === folds - 1 ? t : Math.min(t, segStart + segment)
    const strategy = makeStrategy(prices.slice(0, segStart))
    const weights = computeWeights(prices, strategy, maxLeverage)
    const track = evaluate(returns, weights, model, segStart, segEnd)
    for (const r of track.portReturns) portReturns.push(r)
    turnover += track.turnover
  }
  const equity: number[] = []
  let level = 1
  for (const r of portReturns) {
    level *= 1 + r
    equity.push(level)
  }
  return { equity, weights: [], portReturns, turnover, metrics: summarizePerformance(portReturns, equity, turnover, periodsPerYear) }
}
