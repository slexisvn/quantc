import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { blackScholes } from '../numerics/analytic/black-scholes'

export interface CvaSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly hazardRate: number
  readonly recovery: number
  readonly exposureDates: number
  readonly paths: number
  readonly seed: number
}

export interface CvaResult {
  readonly cva: number
  readonly expectedExposure: number[]
}

export function computeCva(spec: CvaSpec): CvaResult {
  const steps = spec.exposureDates
  const dt = spec.maturity / steps
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol) * dt
  const diffusion = spec.vol * Math.sqrt(dt)
  const generator = new MersenneTwister(spec.seed)

  const exposureSum = new Float64Array(steps)
  const logState = new Float64Array(spec.paths).fill(Math.log(spec.spot))

  for (let step = 0; step < steps; step += 1) {
    const time = (step + 1) * dt
    const remaining = spec.maturity - time
    const stepDiscount = Math.exp(-spec.rate * time)
    for (let p = 0; p < spec.paths; p += 1) {
      logState[p] += drift + diffusion * inverseNormalCdf(generator.nextDouble())
      const spotAtTime = Math.exp(logState[p])
      const value = remaining > 1e-10
        ? blackScholes({ spot: spotAtTime, strike: spec.strike, rate: spec.rate, vol: spec.vol, maturity: remaining, isCall: true }).price
        : Math.max(spotAtTime - spec.strike, 0)
      exposureSum[step] += stepDiscount * Math.max(value, 0)
    }
  }

  const expectedExposure: number[] = []
  for (let step = 0; step < steps; step += 1) expectedExposure.push(exposureSum[step] / spec.paths)

  let cva = 0
  for (let step = 0; step < steps; step += 1) {
    const start = step * dt
    const end = (step + 1) * dt
    const defaultProbability = Math.exp(-spec.hazardRate * start) - Math.exp(-spec.hazardRate * end)
    cva += expectedExposure[step] * defaultProbability
  }
  cva *= 1 - spec.recovery

  return { cva, expectedExposure }
}
