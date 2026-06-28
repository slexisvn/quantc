export interface LocalVolMarket {
  readonly rate: number
  readonly dt: number
  readonly baseVol: number
  readonly elasticity: number
  readonly reference: number
  readonly steps: number
}

interface StepResult {
  readonly logSpot: number
  readonly jacobian: number
}

function advance(logSpot: number, shock: number, market: LocalVolMarket): StepResult {
  const variance = market.baseVol * market.baseVol * Math.exp(2 * market.elasticity * (logSpot - Math.log(market.reference)))
  const volatility = Math.sqrt(variance)
  const sqrtDt = Math.sqrt(market.dt)
  const next = logSpot + (market.rate - 0.5 * variance) * market.dt + volatility * sqrtDt * shock
  const jacobian = 1 - market.elasticity * variance * market.dt + market.elasticity * volatility * sqrtDt * shock
  return { logSpot: next, jacobian }
}

export function pathAverage(shocks: Float64Array, market: LocalVolMarket, logSpot0: number): number {
  let logSpot = logSpot0
  let total = 0
  for (let t = 1; t <= market.steps; t += 1) {
    logSpot = advance(logSpot, shocks[t - 1], market).logSpot
    total += Math.exp(logSpot)
  }
  return total / market.steps
}

export function fullPathGradient(shocks: Float64Array, market: LocalVolMarket, logSpot0: number): { gradient: number; stored: number } {
  const states = new Float64Array(market.steps + 1)
  const jacobians = new Float64Array(market.steps + 1)
  states[0] = logSpot0
  for (let t = 1; t <= market.steps; t += 1) {
    const result = advance(states[t - 1], shocks[t - 1], market)
    states[t] = result.logSpot
    jacobians[t] = result.jacobian
  }

  let adjoint = 0
  for (let t = market.steps; t >= 1; t -= 1) {
    const local = Math.exp(states[t]) / market.steps
    adjoint = (local + adjoint) * jacobians[t]
  }
  return { gradient: adjoint, stored: market.steps + 1 }
}

export function checkpointedPathGradient(shocks: Float64Array, market: LocalVolMarket, logSpot0: number, segment: number): { gradient: number; maxStored: number } {
  const checkpointCount = Math.floor(market.steps / segment) + 1
  const checkpoints = new Float64Array(checkpointCount)
  checkpoints[0] = logSpot0
  let logSpot = logSpot0
  let index = 1
  for (let t = 1; t <= market.steps; t += 1) {
    logSpot = advance(logSpot, shocks[t - 1], market).logSpot
    if (t % segment === 0 && index < checkpointCount) {
      checkpoints[index] = logSpot
      index += 1
    }
  }

  let adjoint = 0
  let maxStored = checkpointCount
  const lastStart = Math.floor((market.steps - 1) / segment) * segment
  for (let start = lastStart; start >= 0; start -= segment) {
    const end = Math.min(start + segment, market.steps)
    const states = new Float64Array(end - start + 1)
    const jacobians = new Float64Array(end - start + 1)
    states[0] = checkpoints[start / segment]
    for (let t = start + 1; t <= end; t += 1) {
      const result = advance(states[t - start - 1], shocks[t - 1], market)
      states[t - start] = result.logSpot
      jacobians[t - start] = result.jacobian
    }
    maxStored = Math.max(maxStored, checkpointCount + (end - start + 1))
    for (let t = end; t > start; t -= 1) {
      const local = Math.exp(states[t - start]) / market.steps
      adjoint = (local + adjoint) * jacobians[t - start]
    }
  }
  return { gradient: adjoint, maxStored }
}
