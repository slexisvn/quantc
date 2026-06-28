import { buildGbmPath, pathBindings, type PathMarket } from './path-engine'
import { runMonteCarlo, type McOutput } from './mc-core'

export interface ExoticResult {
  readonly price: number
  readonly standardError: number
  readonly delta: number
  readonly vega: number
}

function present(output: McOutput, spotId: number, volId: number): ExoticResult {
  return {
    price: output.price,
    standardError: output.standardError,
    delta: output.gradients.get(spotId) ?? 0,
    vega: output.gradients.get(volId) ?? 0,
  }
}

export function priceGeometricAsianCall(market: PathMarket, steps: number): ExoticResult {
  const path = buildGbmPath({ steps })
  const g = path.graph
  let logSum = path.logFixings[0]
  for (let i = 1; i < path.logFixings.length; i += 1) logSum = g.add(logSum, path.logFixings[i])
  const average = g.exp(g.mul(logSum, g.constant(1 / steps)))
  const payoff = g.max(g.sub(average, path.inputs.strike), g.constant(0))
  const discount = g.exp(g.neg(g.mul(path.inputs.rate, path.inputs.maturity)))
  const discounted = g.mul(discount, payoff)
  const price = g.mean(discounted)
  g.output = price
  const output = runMonteCarlo(g, pathBindings(path, market), market.paths, price, discounted, [path.inputs.spot, path.inputs.vol])
  return present(output, path.inputs.spot.id, path.inputs.vol.id)
}

export function priceArithmeticAsianCall(market: PathMarket, steps: number): ExoticResult {
  const path = buildGbmPath({ steps })
  const g = path.graph
  let sum = path.fixings[0]
  for (let i = 1; i < path.fixings.length; i += 1) sum = g.add(sum, path.fixings[i])
  const average = g.mul(sum, g.constant(1 / steps))
  const payoff = g.max(g.sub(average, path.inputs.strike), g.constant(0))
  const discount = g.exp(g.neg(g.mul(path.inputs.rate, path.inputs.maturity)))
  const discounted = g.mul(discount, payoff)
  const price = g.mean(discounted)
  g.output = price
  const output = runMonteCarlo(g, pathBindings(path, market), market.paths, price, discounted, [path.inputs.spot, path.inputs.vol])
  return present(output, path.inputs.spot.id, path.inputs.vol.id)
}

export function priceUpAndOutCall(market: PathMarket, steps: number, barrier: number, smoothing: number): ExoticResult {
  const path = buildGbmPath({ steps })
  const g = path.graph
  const barrierValue = g.constant(barrier)
  const width = g.constant(smoothing)
  let survival = g.sigmoid(g.div(g.sub(barrierValue, path.fixings[0]), width))
  for (let i = 1; i < path.fixings.length; i += 1) {
    survival = g.mul(survival, g.sigmoid(g.div(g.sub(barrierValue, path.fixings[i]), width)))
  }
  const intrinsic = g.max(g.sub(path.terminal, path.inputs.strike), g.constant(0))
  const payoff = g.mul(survival, intrinsic)
  const discount = g.exp(g.neg(g.mul(path.inputs.rate, path.inputs.maturity)))
  const discounted = g.mul(discount, payoff)
  const price = g.mean(discounted)
  g.output = price
  const output = runMonteCarlo(g, pathBindings(path, market), market.paths, price, discounted, [path.inputs.spot, path.inputs.vol])
  return present(output, path.inputs.spot.id, path.inputs.vol.id)
}
