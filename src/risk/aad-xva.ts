import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { blackScholes } from '../numerics/analytic/black-scholes'
import type { CvaSpec } from './xva'

export interface CvaSensitivities {
  readonly cva: number
  readonly dSpot: number
  readonly dHazard: number
}

export function computeCvaSensitivities(spec: CvaSpec): CvaSensitivities {
  const steps = spec.exposureDates
  const dt = spec.maturity / steps
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol) * dt
  const diffusion = spec.vol * Math.sqrt(dt)
  const generator = new MersenneTwister(spec.seed)

  const exposureSum = new Float64Array(steps)
  const exposureSpotSum = new Float64Array(steps)
  const logState = new Float64Array(spec.paths).fill(Math.log(spec.spot))

  for (let step = 0; step < steps; step += 1) {
    const time = (step + 1) * dt
    const remaining = spec.maturity - time
    const stepDiscount = Math.exp(-spec.rate * time)
    for (let p = 0; p < spec.paths; p += 1) {
      logState[p] += drift + diffusion * inverseNormalCdf(generator.nextDouble())
      const spotAtTime = Math.exp(logState[p])
      if (remaining > 1e-10) {
        const valued = blackScholes({ spot: spotAtTime, strike: spec.strike, rate: spec.rate, vol: spec.vol, maturity: remaining, isCall: true })
        exposureSum[step] += stepDiscount * Math.max(valued.price, 0)
        exposureSpotSum[step] += stepDiscount * valued.delta * (spotAtTime / spec.spot)
      } else {
        const intrinsic = Math.max(spotAtTime - spec.strike, 0)
        exposureSum[step] += stepDiscount * intrinsic
        exposureSpotSum[step] += stepDiscount * (spotAtTime > spec.strike ? 1 : 0) * (spotAtTime / spec.spot)
      }
    }
  }

  let cva = 0
  let dSpot = 0
  let dHazard = 0
  for (let step = 0; step < steps; step += 1) {
    const start = step * dt
    const end = (step + 1) * dt
    const defaultProbability = Math.exp(-spec.hazardRate * start) - Math.exp(-spec.hazardRate * end)
    const dDefaultProbability = -start * Math.exp(-spec.hazardRate * start) + end * Math.exp(-spec.hazardRate * end)
    const expectedExposure = exposureSum[step] / spec.paths
    const expectedExposureSpot = exposureSpotSum[step] / spec.paths
    cva += expectedExposure * defaultProbability
    dSpot += expectedExposureSpot * defaultProbability
    dHazard += expectedExposure * dDefaultProbability
  }

  const factor = 1 - spec.recovery
  return { cva: cva * factor, dSpot: dSpot * factor, dHazard: dHazard * factor }
}
