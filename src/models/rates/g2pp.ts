import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { normalCdf } from '../../numerics/analytic/black-scholes'
import { affineBFactor, affineCouponFlows } from './common'

export interface G2ppSpec {
  readonly flatRate: number
  readonly meanReversionA: number
  readonly meanReversionB: number
  readonly volA: number
  readonly volB: number
  readonly correlation: number
}

export function g2ppVariance(spec: G2ppSpec, tenor: number): number {
  const { meanReversionA: a, meanReversionB: b, volA: sigma, volB: eta, correlation: rho } = spec
  const termA = (sigma * sigma / (a * a)) * (tenor + (2 / a) * Math.exp(-a * tenor) - (1 / (2 * a)) * Math.exp(-2 * a * tenor) - 3 / (2 * a))
  const termB = (eta * eta / (b * b)) * (tenor + (2 / b) * Math.exp(-b * tenor) - (1 / (2 * b)) * Math.exp(-2 * b * tenor) - 3 / (2 * b))
  const cross = (2 * rho * sigma * eta / (a * b)) * (tenor + (Math.exp(-a * tenor) - 1) / a + (Math.exp(-b * tenor) - 1) / b - (Math.exp(-(a + b) * tenor) - 1) / (a + b))
  return termA + termB + cross
}

export function g2ppBondToday(spec: G2ppSpec, maturity: number): number {
  return Math.exp(-spec.flatRate * maturity + 0.5 * g2ppVariance(spec, maturity))
}

function g2ppBond(spec: G2ppSpec, t: number, maturity: number, x: number, y: number): number {
  const tenor = maturity - t
  const marketRatio = Math.exp(-spec.flatRate * maturity) / Math.exp(-spec.flatRate * t)
  const adjustment = 0.5 * (g2ppVariance(spec, tenor) - g2ppVariance(spec, maturity) + g2ppVariance(spec, t))
  return marketRatio * Math.exp(adjustment - affineBFactor(spec.meanReversionA, tenor) * x - affineBFactor(spec.meanReversionB, tenor) * y)
}

export interface SwaptionTerms {
  readonly expiry: number
  readonly times: number[]
  readonly accruals: number[]
  readonly fixedRate: number
}

function forwardMean(primaryVol: number, primaryRev: number, secondaryVol: number, secondaryRev: number, rho: number, expiry: number): number {
  const a = primaryRev
  const b = secondaryRev
  const sigma = primaryVol
  const eta = secondaryVol
  const m = (sigma * sigma / (a * a) + (rho * sigma * eta) / (a * b)) * (1 - Math.exp(-a * expiry))
    - (sigma * sigma / (2 * a * a)) * (1 - Math.exp(-2 * a * expiry))
    - (rho * sigma * eta) / (b * (a + b)) * (1 - Math.exp(-(a + b) * expiry))
  return -m
}

export function g2ppPayerSwaption(spec: G2ppSpec, terms: SwaptionTerms, integrationPoints: number): number {
  const { meanReversionA: a, meanReversionB: b, volA: sigma, volB: eta, correlation: rho } = spec
  const expiry = terms.expiry
  const flows = affineCouponFlows(terms.accruals, terms.fixedRate)
  const factorA = terms.times.map((t) => affineBFactor(a, t - expiry))
  const factorB = terms.times.map((t) => affineBFactor(b, t - expiry))
  const amplitude = terms.times.map((t) => g2ppBond(spec, expiry, t, 0, 0))

  const sigmaX = sigma * Math.sqrt((1 - Math.exp(-2 * a * expiry)) / (2 * a))
  const sigmaY = eta * Math.sqrt((1 - Math.exp(-2 * b * expiry)) / (2 * b))
  const rhoXy = (rho * sigma * eta) / ((a + b) * sigmaX * sigmaY) * (1 - Math.exp(-(a + b) * expiry))
  const muX = forwardMean(sigma, a, eta, b, rho, expiry)
  const muY = forwardMean(eta, b, sigma, a, rho, expiry)
  const complement = Math.sqrt(1 - rhoXy * rhoXy)

  const solveBoundary = (x: number): number => {
    const residual = (y: number): number => {
      let sum = 0
      for (let i = 0; i < flows.length; i += 1) sum += flows[i] * amplitude[i] * Math.exp(-factorA[i] * x - factorB[i] * y)
      return sum - 1
    }
    let low = -2
    let high = 2
    while (residual(low) < 0) low -= 2
    while (residual(high) > 0) high += 2
    for (let iteration = 0; iteration < 80; iteration += 1) {
      const mid = 0.5 * (low + high)
      if (residual(mid) > 0) low = mid
      else high = mid
    }
    return 0.5 * (low + high)
  }

  const lower = muX - 8 * sigmaX
  const upper = muX + 8 * sigmaX
  const steps = integrationPoints
  const step = (upper - lower) / steps
  let integral = 0
  for (let k = 0; k <= steps; k += 1) {
    const x = lower + k * step
    const boundary = solveBoundary(x)
    const h1 = (boundary - muY) / (sigmaY * complement) - (rhoXy * (x - muX)) / (sigmaX * complement)
    let inner = normalCdf(-h1)
    for (let i = 0; i < flows.length; i += 1) {
      const lambda = flows[i] * amplitude[i] * Math.exp(-factorA[i] * x)
      const kappa = -factorB[i] * (muY - 0.5 * complement * complement * sigmaY * sigmaY * factorB[i] + (rhoXy * sigmaY * (x - muX)) / sigmaX)
      const h2 = h1 + factorB[i] * sigmaY * complement
      inner -= lambda * Math.exp(kappa) * normalCdf(-h2)
    }
    const density = Math.exp(-0.5 * ((x - muX) / sigmaX) * ((x - muX) / sigmaX)) / (sigmaX * Math.sqrt(2 * Math.PI))
    const weight = k === 0 || k === steps ? 0.5 : 1
    integral += weight * density * inner * step
  }
  return Math.exp(-spec.flatRate * expiry) * integral
}

export function g2ppPayerSwaptionMc(spec: G2ppSpec, terms: SwaptionTerms, steps: number, paths: number, seed: number): number {
  const dt = terms.expiry / steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const flows = affineCouponFlows(terms.accruals, terms.fixedRate)
  const generator = new MersenneTwister(seed)

  let total = 0
  for (let p = 0; p < paths; p += 1) {
    let x = 0
    let y = 0
    let integral = 0
    for (let step = 0; step < steps; step += 1) {
      integral += (x + y + spec.flatRate) * dt
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = spec.correlation * z1 + rhoComplement * inverseNormalCdf(generator.nextDouble())
      x += -spec.meanReversionA * x * dt + spec.volA * sqrtDt * z1
      y += -spec.meanReversionB * y * dt + spec.volB * sqrtDt * z2
    }
    let couponBond = 0
    for (let i = 0; i < terms.times.length; i += 1) couponBond += flows[i] * g2ppBond(spec, terms.expiry, terms.times[i], x, y)
    total += Math.exp(-integral) * Math.max(1 - couponBond, 0)
  }
  return total / paths
}
