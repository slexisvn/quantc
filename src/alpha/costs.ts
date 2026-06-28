export interface CostContext {
  readonly price?: number[]
}

export type CostModel = (trade: number[], weights: number[], context?: CostContext) => number

export function linearCost(rate = 0.0005): CostModel {
  return (trade) => rate * trade.reduce((sum, x) => sum + Math.abs(x), 0)
}

export function squareRootImpact(coefficient = 0.1): CostModel {
  return (trade) => trade.reduce((sum, x) => sum + coefficient * Math.abs(x) ** 1.5, 0)
}

export function borrowCost(annualRate = 0.01, periodsPerYear = 252): CostModel {
  const perPeriod = annualRate / periodsPerYear
  return (_trade, weights) => perPeriod * weights.reduce((sum, w) => sum + Math.max(-w, 0), 0)
}

export function combineCosts(...models: CostModel[]): CostModel {
  return (trade, weights, context) => models.reduce((sum, model) => sum + model(trade, weights, context), 0)
}

export const COSTS: Record<string, (params?: Record<string, number>) => CostModel> = {
  linear: (params = {}) => linearCost(params.rate),
  squareRootImpact: (params = {}) => squareRootImpact(params.coefficient),
  borrow: (params = {}) => borrowCost(params.annualRate, params.periodsPerYear),
}
