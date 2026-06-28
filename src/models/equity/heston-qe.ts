import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'
import type { HestonSpec, HestonResult } from './heston'

const PSI_CRITICAL = 1.5

export function priceHestonCallQe(spec: HestonSpec): HestonResult {
  const dt = spec.maturity / spec.steps
  const kappa = spec.meanReversion
  const theta = spec.longVariance
  const xi = spec.volOfVol
  const rho = spec.correlation
  const expKappa = Math.exp(-kappa * dt)
  const gamma = 0.5

  const k0 = (-rho * kappa * theta * dt) / xi
  const k1 = gamma * dt * ((kappa * rho) / xi - 0.5) - rho / xi
  const k2 = gamma * dt * ((kappa * rho) / xi - 0.5) + rho / xi
  const k3 = gamma * dt * (1 - rho * rho)
  const k4 = gamma * dt * (1 - rho * rho)

  const generator = new MersenneTwister(spec.seed)
  const discount = Math.exp(-spec.rate * spec.maturity)
  const estimator = new Welford()

  for (let p = 0; p < spec.paths; p += 1) {
    let logSpot = Math.log(spec.spot)
    let variance = spec.initialVariance
    for (let step = 0; step < spec.steps; step += 1) {
      const mean = theta + (variance - theta) * expKappa
      const s2 = (variance * xi * xi * expKappa * (1 - expKappa)) / kappa + (theta * xi * xi * (1 - expKappa) * (1 - expKappa)) / (2 * kappa)
      const psi = s2 / (mean * mean)

      let nextVariance: number
      const zv = inverseNormalCdf(generator.nextDouble())
      if (psi <= PSI_CRITICAL) {
        const invPsi = 2 / psi
        const b2 = invPsi - 1 + Math.sqrt(invPsi) * Math.sqrt(invPsi - 1)
        const a = mean / (1 + b2)
        const b = Math.sqrt(b2)
        nextVariance = a * (b + zv) * (b + zv)
      } else {
        const pProb = (psi - 1) / (psi + 1)
        const beta = (1 - pProb) / mean
        const uniform = generator.nextDouble()
        nextVariance = uniform <= pProb ? 0 : Math.log((1 - pProb) / (1 - uniform)) / beta
      }

      const zs = inverseNormalCdf(generator.nextDouble())
      logSpot += spec.rate * dt + k0 + k1 * variance + k2 * nextVariance + Math.sqrt(k3 * variance + k4 * nextVariance) * zs
      variance = nextVariance
    }
    estimator.push(discount * Math.max(Math.exp(logSpot) - spec.strike, 0))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
