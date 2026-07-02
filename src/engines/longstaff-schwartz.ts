import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { ridgeRegression } from '../alpha/regression'
import type { Basis } from '../numerics/basis'

export interface BermudanSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly exerciseDates: number
  readonly paths: number
  readonly seed: number
  readonly basis?: Basis
  readonly ridgeLambda?: number
}

function intrinsic(spot: number, strike: number, isCall: boolean): number {
  return isCall ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)
}

function simulatePaths(spec: BermudanSpec): Float64Array[] {
  const steps = spec.exerciseDates
  const dt = spec.maturity / steps
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol) * dt
  const diffusion = spec.vol * Math.sqrt(dt)
  const generator = new MersenneTwister(spec.seed)

  const logState = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  const fixings: Float64Array[] = []
  for (let step = 0; step < steps; step += 1) {
    const level = new Float64Array(spec.paths)
    for (let p = 0; p < spec.paths; p += 1) {
      logState[p] += drift + diffusion * inverseNormalCdf(generator.nextDouble())
      level[p] = Math.exp(logState[p])
    }
    fixings.push(level)
  }
  return fixings
}

export function priceBermudanLsm(spec: BermudanSpec): number {
  const steps = spec.exerciseDates
  const dt = spec.maturity / steps
  const stepDiscount = Math.exp(-spec.rate * dt)
  const fixings = simulatePaths(spec)

  const value = new Float64Array(spec.paths)
  const last = fixings[steps - 1]
  for (let p = 0; p < spec.paths; p += 1) value[p] = intrinsic(last[p], spec.strike, spec.isCall)

  for (let step = steps - 2; step >= 0; step -= 1) {
    for (let p = 0; p < spec.paths; p += 1) value[p] *= stepDiscount
    const level = fixings[step]

    if (spec.basis === undefined) {
      const ata = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]
      const aty = [0, 0, 0]
      const inMoney: number[] = []
      for (let p = 0; p < spec.paths; p += 1) {
        if (intrinsic(level[p], spec.strike, spec.isCall) <= 0) continue
        inMoney.push(p)
        const x = level[p] / spec.strike
        const basis = [1, x, x * x]
        for (let i = 0; i < 3; i += 1) {
          for (let j = 0; j < 3; j += 1) ata[i][j] += basis[i] * basis[j]
          aty[i] += basis[i] * value[p]
        }
      }
      if (inMoney.length < 3) continue

      const coefficients = solveLinearSystem(ata, aty)
      for (const p of inMoney) {
        const x = level[p] / spec.strike
        const continuation = coefficients[0] + coefficients[1] * x + coefficients[2] * x * x
        const exercise = intrinsic(level[p], spec.strike, spec.isCall)
        if (exercise > continuation) value[p] = exercise
      }
      continue
    }

    const design: number[][] = []
    const response: number[] = []
    const inMoney: number[] = []
    for (let p = 0; p < spec.paths; p += 1) {
      if (intrinsic(level[p], spec.strike, spec.isCall) <= 0) continue
      inMoney.push(p)
      design.push(spec.basis.evaluate(level[p] / spec.strike))
      response.push(value[p])
    }
    if (inMoney.length < spec.basis.size) continue

    const coefficients = ridgeRegression(design, response, spec.ridgeLambda ?? 0)
    for (const p of inMoney) {
      const features = spec.basis.evaluate(level[p] / spec.strike)
      let continuation = 0
      for (let i = 0; i < features.length; i += 1) continuation += features[i] * coefficients[i]
      const exercise = intrinsic(level[p], spec.strike, spec.isCall)
      if (exercise > continuation) value[p] = exercise
    }
  }

  let total = 0
  for (let p = 0; p < spec.paths; p += 1) total += value[p] * stepDiscount
  return total / spec.paths
}
