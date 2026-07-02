import { Sobol } from '../numerics/rng/sobol'
import { BrownianBridge } from '../numerics/rng/brownian-bridge'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { rqmcEstimate, type RqmcResult } from './rqmc'

export interface QmcMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
}

function europeanCallPayoff(market: QmcMarket, uniform: number): number {
  const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
  const diffusion = market.vol * Math.sqrt(market.maturity)
  const discount = Math.exp(-market.rate * market.maturity)
  const z = inverseNormalCdf(uniform)
  return discount * Math.max(market.spot * Math.exp(drift + diffusion * z) - market.strike, 0)
}

function asianCallPayoff(market: QmcMarket, steps: number, uniforms: Float64Array, bridge: BrownianBridge): number {
  const dt = market.maturity / steps
  const sqrtDt = Math.sqrt(dt)
  const discount = Math.exp(-market.rate * market.maturity)
  const normals = new Float64Array(steps)
  for (let s = 0; s < steps; s += 1) normals[s] = inverseNormalCdf(uniforms[s])
  const path = bridge.buildPath(normals)
  let sum = 0
  for (let s = 0; s < steps; s += 1) {
    const time = (s + 1) * dt
    sum += market.spot * Math.exp((market.rate - 0.5 * market.vol * market.vol) * time + market.vol * sqrtDt * path[s])
  }
  return discount * Math.max(sum / steps - market.strike, 0)
}

export function qmcEuropeanCall(market: QmcMarket, points: number): number {
  const generator = new Sobol(1)
  let total = 0
  for (let i = 0; i < points; i += 1) total += europeanCallPayoff(market, generator.next()[0])
  return total / points
}

export function qmcAsianCall(market: QmcMarket, steps: number, points: number): number {
  const generator = new Sobol(steps)
  const bridge = new BrownianBridge(steps)
  let total = 0
  for (let i = 0; i < points; i += 1) total += asianCallPayoff(market, steps, generator.next(), bridge)
  return total / points
}

export function rqmcEuropeanCall(market: QmcMarket, points: number, randomizations: number, seed: number, confidence = 0.95): RqmcResult {
  return rqmcEstimate((point) => europeanCallPayoff(market, point[0]), 1, points, randomizations, seed, confidence)
}

export function rqmcAsianCall(market: QmcMarket, steps: number, points: number, randomizations: number, seed: number, confidence = 0.95): RqmcResult {
  const bridge = new BrownianBridge(steps)
  return rqmcEstimate((point) => asianCallPayoff(market, steps, point, bridge), steps, points, randomizations, seed, confidence)
}
