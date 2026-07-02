import type { Matrix } from './types'
import { rows, cols, meanStd } from './util'
import { sharpe } from './metrics'

export interface CapacityPoint {
  readonly aum: number
  readonly grossSharpe: number
  readonly netSharpe: number
  readonly costDrag: number
}

export interface CapacityOptions {
  readonly adv?: readonly number[]
  readonly impactCoefficient: number
  readonly linearRate: number
  readonly periodsPerYear: number
}

export function capacitySweep(weights: Matrix, returns: Matrix, aums: readonly number[], options: Partial<CapacityOptions> = {}): CapacityPoint[] {
  const { adv, impactCoefficient = 0.1, linearRate = 0.0005, periodsPerYear = 252 } = options
  const t = Math.min(rows(weights), rows(returns))
  const n = cols(returns)
  const grossSeries: number[] = []
  const turnoverPerAsset: number[][] = []
  for (let i = 1; i < t; i += 1) {
    let gross = 0
    const traded = new Array<number>(n).fill(0)
    for (let j = 0; j < n; j += 1) {
      gross += weights[i - 1][j] * returns[i][j]
      traded[j] = Math.abs(weights[i - 1][j] - (i - 2 >= 0 ? weights[i - 2][j] : 0))
    }
    grossSeries.push(gross)
    turnoverPerAsset.push(traded)
  }
  const grossSharpe = sharpe(grossSeries, periodsPerYear)
  return aums.map((aum) => {
    const netSeries = grossSeries.map((gross, step) => {
      let cost = 0
      for (let j = 0; j < n; j += 1) {
        const traded = turnoverPerAsset[step][j]
        const participation = adv ? (aum * traded) / Math.max(adv[j], 1e-12) : 0
        cost += linearRate * traded + impactCoefficient * Math.sqrt(participation) * traded
      }
      return gross - cost
    })
    const netSharpe = sharpe(netSeries, periodsPerYear)
    const costDrag = (meanStd(grossSeries).mean - meanStd(netSeries).mean) * periodsPerYear
    return { aum, grossSharpe, netSharpe, costDrag }
  })
}
