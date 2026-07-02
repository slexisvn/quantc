import type { FrtbParameters } from './frtb-parameters'

export const DRC_MATURITY_FLOOR = 0.25

export interface DrcPosition {
  readonly obligor: string
  readonly seniority: number
  readonly jtd: number
  readonly maturity: number
  readonly rating: string
}

function drcRiskWeight(params: FrtbParameters, rating: string): number {
  const weight = params.drcRiskWeights.get(rating)
  if (weight === undefined) throw new Error(`unknown DRC rating ${rating}`)
  return weight
}

interface ObligorNet {
  readonly long: number
  readonly short: number
  readonly riskWeight: number
}

function nettedObligor(positions: readonly DrcPosition[], params: FrtbParameters): ObligorNet {
  const bySeniority = new Map<number, number>()
  for (const position of positions) {
    const scaled = position.jtd * Math.max(Math.min(position.maturity, 1), DRC_MATURITY_FLOOR)
    bySeniority.set(position.seniority, (bySeniority.get(position.seniority) ?? 0) + scaled)
  }
  const levels = [...bySeniority.entries()].sort((a, b) => a[0] - b[0]).map(([seniority, net]) => ({ seniority, net }))
  for (let i = 0; i < levels.length; i += 1) {
    if (levels[i].net >= 0) continue
    let shortAmount = -levels[i].net
    for (let j = i + 1; j < levels.length && shortAmount > 0; j += 1) {
      if (levels[j].net <= 0) continue
      const offset = Math.min(shortAmount, levels[j].net)
      levels[j].net -= offset
      shortAmount -= offset
    }
    levels[i].net = -shortAmount
  }
  let long = 0
  let short = 0
  for (const level of levels) {
    if (level.net > 0) long += level.net
    else short += -level.net
  }
  return { long, short, riskWeight: drcRiskWeight(params, positions[0].rating) }
}

export function drcCharge(positions: readonly DrcPosition[], params: FrtbParameters): number {
  const byObligor = new Map<string, DrcPosition[]>()
  for (const position of positions) {
    const existing = byObligor.get(position.obligor)
    if (existing !== undefined) existing.push(position)
    else byObligor.set(position.obligor, [position])
  }
  let weightedLong = 0
  let weightedShort = 0
  let grossLong = 0
  let grossShort = 0
  for (const group of byObligor.values()) {
    const net = nettedObligor(group, params)
    weightedLong += net.riskWeight * net.long
    weightedShort += net.riskWeight * net.short
    grossLong += net.long
    grossShort += net.short
  }
  const denominator = grossLong + grossShort
  const hedgeBenefit = denominator > 0 ? grossLong / denominator : 0
  return Math.max(0, weightedLong - hedgeBenefit * weightedShort)
}
