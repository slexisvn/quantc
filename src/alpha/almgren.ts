export interface AlmgrenChrissConfig {
  readonly totalShares: number
  readonly periods: number
  readonly riskAversion: number
  readonly volatility: number
  readonly temporaryImpact: number
  readonly permanentImpact: number
}

export interface ExecutionTrajectory {
  readonly holdings: number[]
  readonly trades: number[]
  readonly expectedCost: number
  readonly costVariance: number
  readonly kappa: number
}

export function almgrenChriss(config: AlmgrenChrissConfig): ExecutionTrajectory {
  const { totalShares, periods, riskAversion, volatility, temporaryImpact, permanentImpact } = config
  const adjustedImpact = Math.max(temporaryImpact - 0.5 * permanentImpact, 1e-18)
  const kappaSquared = (riskAversion * volatility * volatility) / adjustedImpact
  const kappa = Math.sqrt(kappaSquared)
  const holdings = Array.from({ length: periods + 1 }, (_, t) =>
    kappa * periods < 1e-9 ? totalShares * ((periods - t) / periods) : totalShares * (Math.sinh(kappa * (periods - t)) / Math.sinh(kappa * periods)),
  )
  const trades = Array.from({ length: periods }, (_, t) => holdings[t] - holdings[t + 1])
  let expectedCost = 0.5 * permanentImpact * totalShares * totalShares
  for (const trade of trades) expectedCost += adjustedImpact * trade * trade
  let costVariance = 0
  for (let t = 1; t <= periods; t += 1) costVariance += volatility * volatility * holdings[t] * holdings[t]
  return { holdings, trades, expectedCost, costVariance, kappa }
}
