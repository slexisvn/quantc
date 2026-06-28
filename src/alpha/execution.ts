import type { Matrix, Strategy, BacktestResult } from './types'
import { rows, cols, capLeverage } from './util'
import { summarizePerformance } from './metrics'
import { linearCost, type CostModel } from './costs'

export interface ExecutionConfig {
  readonly costModel?: CostModel
  readonly slippageBps?: number
  readonly financingRate?: number
  readonly periodsPerYear?: number
  readonly rebalanceEvery?: number
  readonly maxLeverage?: number
}

export function eventBacktest(prices: Matrix, strategy: Strategy, config: ExecutionConfig = {}): BacktestResult {
  const { costModel, slippageBps = 0, financingRate = 0, periodsPerYear = 252, rebalanceEvery = 1, maxLeverage = Infinity } = config
  const model = costModel ?? linearCost(0)
  const t = rows(prices)
  const n = cols(prices)
  const targets = capLeverage(strategy.portfolio(strategy.signal(prices)), maxLeverage)
  const slippage = slippageBps / 10000
  const financePerPeriod = financingRate / periodsPerYear
  let weights = new Array<number>(n).fill(0)
  let level = 1
  let turnover = 0
  const equity: number[] = []
  const portReturns: number[] = []
  for (let i = 1; i < t; i += 1) {
    let drift = 0
    const stepReturns = new Array<number>(n).fill(0)
    for (let j = 0; j < n; j += 1) {
      stepReturns[j] = prices[i - 1][j] === 0 ? 0 : prices[i][j] / prices[i - 1][j] - 1
      drift += weights[j] * stepReturns[j]
    }
    const drifted = weights.map((w, j) => (1 + drift === 0 ? 0 : (w * (1 + stepReturns[j])) / (1 + drift)))
    const financeCost = financePerPeriod * drifted.reduce((sum, w) => sum + Math.max(-w, 0), 0)
    let tradeCost = 0
    let traded = 0
    let positioned = drifted
    if (i % rebalanceEvery === 0) {
      const target = targets[i]
      const trade = target.map((w, j) => w - drifted[j])
      for (const x of trade) traded += Math.abs(x)
      tradeCost = model(trade, drifted) + slippage * traded
      positioned = target
    }
    const net = drift - financeCost - tradeCost
    level *= 1 + net
    turnover += traded
    weights = positioned
    equity.push(level)
    portReturns.push(net)
  }
  return { equity, weights: targets, portReturns, turnover, metrics: summarizePerformance(portReturns, equity, turnover, periodsPerYear) }
}
