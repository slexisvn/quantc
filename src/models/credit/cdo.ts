import { normalPdf } from '../../numerics/analytic/black-scholes'
import { conditionalDefaultProbability } from './gaussian-copula'

export interface CdoSpec {
  readonly names: number
  readonly defaultProbability: number
  readonly recovery: number
  readonly correlation: number
  readonly attachment: number
  readonly detachment: number
  readonly quadraturePoints: number
}

function conditionalLossDistribution(names: number, probability: number): Float64Array {
  const distribution = new Float64Array(names + 1)
  distribution[0] = 1
  for (let name = 0; name < names; name += 1) {
    for (let k = name + 1; k >= 1; k -= 1) distribution[k] = distribution[k] * (1 - probability) + distribution[k - 1] * probability
    distribution[0] *= 1 - probability
  }
  return distribution
}

export function trancheExpectedLoss(spec: CdoSpec): number {
  const lossGivenDefault = 1 - spec.recovery
  const width = spec.detachment - spec.attachment
  const lower = -6
  const upper = 6
  const step = (upper - lower) / spec.quadraturePoints

  let expectedLoss = 0
  let weightSum = 0
  for (let q = 0; q < spec.quadraturePoints; q += 1) {
    const factor = lower + (q + 0.5) * step
    const weight = normalPdf(factor) * step
    weightSum += weight
    const probability = conditionalDefaultProbability(spec.defaultProbability, spec.correlation, factor)
    const distribution = conditionalLossDistribution(spec.names, probability)
    let conditionalLoss = 0
    for (let k = 0; k <= spec.names; k += 1) {
      const portfolioLoss = (lossGivenDefault * k) / spec.names
      const trancheLoss = Math.min(Math.max(portfolioLoss - spec.attachment, 0), width)
      conditionalLoss += distribution[k] * trancheLoss
    }
    expectedLoss += weight * conditionalLoss
  }
  return expectedLoss / weightSum
}
