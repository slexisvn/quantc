import { normalCdf } from '../../numerics/analytic/black-scholes'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'

export function conditionalDefaultProbability(defaultProbability: number, correlation: number, factor: number): number {
  const threshold = inverseNormalCdf(defaultProbability)
  return normalCdf((threshold - Math.sqrt(correlation) * factor) / Math.sqrt(1 - correlation))
}
