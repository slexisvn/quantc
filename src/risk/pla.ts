import { spearman } from '../alpha/stats'
import type { FrtbParameters } from './frtb-parameters'
import type { BacktestZone } from './backtesting'

function ksStatistic(a: readonly number[], b: readonly number[]): number {
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  const na = sortedA.length
  const nb = sortedB.length
  let i = 0
  let j = 0
  let distance = 0
  while (i < na && j < nb) {
    const value = Math.min(sortedA[i], sortedB[j])
    while (i < na && sortedA[i] === value) i += 1
    while (j < nb && sortedB[j] === value) j += 1
    distance = Math.max(distance, Math.abs(i / na - j / nb))
  }
  return distance
}

export interface PlaResult {
  readonly spearman: number
  readonly ks: number
  readonly zone: BacktestZone
}

export function plaTest(hypotheticalPnl: readonly number[], riskTheoreticalPnl: readonly number[], params: FrtbParameters): PlaResult {
  const correlation = spearman([...hypotheticalPnl], [...riskTheoreticalPnl])
  const ks = ksStatistic(hypotheticalPnl, riskTheoreticalPnl)
  const thresholds = params.plaThresholds
  let zone: BacktestZone
  if (correlation < thresholds.spearmanRed || ks > thresholds.ksRed) zone = 'red'
  else if (correlation >= thresholds.spearmanGreen && ks <= thresholds.ksGreen) zone = 'green'
  else zone = 'amber'
  return { spearman: correlation, ks, zone }
}
