import { chiSquareCdf } from '../numerics/stats/gamma'
import type { FrtbParameters } from './frtb-parameters'

export type BacktestZone = 'green' | 'amber' | 'red'

export interface LikelihoodRatioTest {
  readonly statistic: number
  readonly pValue: number
}

function safeLog(value: number): number {
  return value > 0 ? Math.log(value) : 0
}

export function kupiecPof(exceptions: number, observations: number, coverage: number): LikelihoodRatioTest {
  const expectedRate = 1 - coverage
  const observedRate = observations > 0 ? exceptions / observations : 0
  const nonExceptions = observations - exceptions
  const logNull = nonExceptions * safeLog(1 - expectedRate) + exceptions * safeLog(expectedRate)
  const logAlt = nonExceptions * safeLog(1 - observedRate) + exceptions * safeLog(observedRate)
  const statistic = Math.max(-2 * (logNull - logAlt), 0)
  return { statistic, pValue: 1 - chiSquareCdf(statistic, 1) }
}

export interface TransitionCounts {
  readonly n00: number
  readonly n01: number
  readonly n10: number
  readonly n11: number
}

export function transitionCounts(exceedances: readonly number[]): TransitionCounts {
  let n00 = 0
  let n01 = 0
  let n10 = 0
  let n11 = 0
  for (let i = 1; i < exceedances.length; i += 1) {
    const previous = exceedances[i - 1] > 0 ? 1 : 0
    const current = exceedances[i] > 0 ? 1 : 0
    if (previous === 0 && current === 0) n00 += 1
    else if (previous === 0 && current === 1) n01 += 1
    else if (previous === 1 && current === 0) n10 += 1
    else n11 += 1
  }
  return { n00, n01, n10, n11 }
}

export function christoffersenIndependence(exceedances: readonly number[]): LikelihoodRatioTest {
  const { n00, n01, n10, n11 } = transitionCounts(exceedances)
  const pi01 = n00 + n01 > 0 ? n01 / (n00 + n01) : 0
  const pi11 = n10 + n11 > 0 ? n11 / (n10 + n11) : 0
  const pi = n00 + n01 + n10 + n11 > 0 ? (n01 + n11) / (n00 + n01 + n10 + n11) : 0
  const logNull = (n00 + n10) * safeLog(1 - pi) + (n01 + n11) * safeLog(pi)
  const logAlt = n00 * safeLog(1 - pi01) + n01 * safeLog(pi01) + n10 * safeLog(1 - pi11) + n11 * safeLog(pi11)
  const statistic = Math.max(-2 * (logNull - logAlt), 0)
  return { statistic, pValue: 1 - chiSquareCdf(statistic, 1) }
}

export function christoffersenConditionalCoverage(exceedances: readonly number[], coverage: number): LikelihoodRatioTest {
  let exceptions = 0
  for (const value of exceedances) if (value > 0) exceptions += 1
  const uc = kupiecPof(exceptions, exceedances.length, coverage)
  const ind = christoffersenIndependence(exceedances)
  const statistic = uc.statistic + ind.statistic
  return { statistic, pValue: 1 - chiSquareCdf(statistic, 2) }
}

export function baselTrafficLight(exceptions: number, params: FrtbParameters): BacktestZone {
  if (exceptions >= params.trafficLight.redExceptions) return 'red'
  if (exceptions >= params.trafficLight.amberExceptions) return 'amber'
  return 'green'
}
