import type { BacktestResult, Matrix } from './types'
import { rollingSharpe, drawdownTable, type DrawdownEpisode } from './analytics'
import { alphaBeta, informationRatio, trackingError } from './benchmark'

export interface Exposure {
  readonly grossMean: number
  readonly netMean: number
  readonly turnover: number
}

export interface BenchmarkStats {
  readonly alpha: number
  readonly beta: number
  readonly informationRatio: number
  readonly trackingError: number
}

export interface TearSheet {
  readonly metrics: Record<string, number>
  readonly drawdowns: DrawdownEpisode[]
  readonly rollingSharpe: number[]
  readonly exposure: Exposure
  readonly benchmark?: BenchmarkStats
}

export interface TearSheetOptions {
  readonly benchmarkReturns?: number[]
  readonly rollingWindow?: number
  readonly periodsPerYear?: number
}

function computeExposure(weights: Matrix, turnover: number): Exposure {
  const t = weights.length
  if (t === 0) return { grossMean: 0, netMean: 0, turnover }
  let gross = 0
  let net = 0
  for (const row of weights) {
    for (const w of row) {
      gross += Math.abs(w)
      net += w
    }
  }
  return { grossMean: gross / t, netMean: net / t, turnover }
}

export function tearSheet(result: BacktestResult, options: TearSheetOptions = {}): TearSheet {
  const { benchmarkReturns, rollingWindow = 60, periodsPerYear = 252 } = options
  let benchmark: BenchmarkStats | undefined
  if (benchmarkReturns) {
    const ab = alphaBeta(result.portReturns, benchmarkReturns, periodsPerYear)
    benchmark = {
      alpha: ab.alpha,
      beta: ab.beta,
      informationRatio: informationRatio(result.portReturns, benchmarkReturns, periodsPerYear),
      trackingError: trackingError(result.portReturns, benchmarkReturns, periodsPerYear),
    }
  }
  return {
    metrics: result.metrics,
    drawdowns: drawdownTable(result.equity),
    rollingSharpe: rollingSharpe(result.portReturns, rollingWindow, periodsPerYear),
    exposure: computeExposure(result.weights, result.turnover),
    benchmark,
  }
}
