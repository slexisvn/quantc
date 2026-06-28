import { Sobol } from '../numerics/rng/sobol'
import { BrownianBridge } from '../numerics/rng/brownian-bridge'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'

export interface QmcMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
}

export function qmcEuropeanCall(market: QmcMarket, points: number): number {
  const generator = new Sobol(1)
  const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
  const diffusion = market.vol * Math.sqrt(market.maturity)
  const discount = Math.exp(-market.rate * market.maturity)
  let total = 0
  for (let i = 0; i < points; i += 1) {
    const z = inverseNormalCdf(generator.next()[0])
    total += discount * Math.max(market.spot * Math.exp(drift + diffusion * z) - market.strike, 0)
  }
  return total / points
}

export function qmcAsianCall(market: QmcMarket, steps: number, points: number): number {
  const generator = new Sobol(steps)
  const bridge = new BrownianBridge(steps)
  const dt = market.maturity / steps
  const sqrtDt = Math.sqrt(dt)
  const discount = Math.exp(-market.rate * market.maturity)

  let total = 0
  for (let i = 0; i < points; i += 1) {
    const uniforms = generator.next()
    const normals = new Float64Array(steps)
    for (let s = 0; s < steps; s += 1) normals[s] = inverseNormalCdf(uniforms[s])
    const path = bridge.buildPath(normals)
    let sum = 0
    for (let s = 0; s < steps; s += 1) {
      const time = (s + 1) * dt
      sum += market.spot * Math.exp((market.rate - 0.5 * market.vol * market.vol) * time + market.vol * sqrtDt * path[s])
    }
    total += discount * Math.max(sum / steps - market.strike, 0)
  }
  return total / points
}
