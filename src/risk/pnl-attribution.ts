import { blackScholes } from '../numerics/analytic/black-scholes'

export interface PnlScenario {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly spotMove: number
  readonly volMove: number
  readonly timeMove: number
}

export interface PnlAttribution {
  readonly actual: number
  readonly delta: number
  readonly gamma: number
  readonly vega: number
  readonly theta: number
  readonly explained: number
  readonly unexplained: number
}

export function attributePnl(scenario: PnlScenario): PnlAttribution {
  const greeks = blackScholes(scenario)
  const after = blackScholes({
    spot: scenario.spot + scenario.spotMove,
    strike: scenario.strike,
    rate: scenario.rate,
    vol: scenario.vol + scenario.volMove,
    maturity: scenario.maturity - scenario.timeMove,
    isCall: scenario.isCall,
  })

  const deltaPnl = greeks.delta * scenario.spotMove
  const gammaPnl = 0.5 * greeks.gamma * scenario.spotMove * scenario.spotMove
  const vegaPnl = greeks.vega * scenario.volMove
  const thetaPnl = greeks.theta * scenario.timeMove
  const explained = deltaPnl + gammaPnl + vegaPnl + thetaPnl
  const actual = after.price - greeks.price

  return { actual, delta: deltaPnl, gamma: gammaPnl, vega: vegaPnl, theta: thetaPnl, explained, unexplained: actual - explained }
}
