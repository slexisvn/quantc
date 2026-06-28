import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { solveLinearSystem } from '../numerics/linalg/solve'

export interface BermudanDualSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly exerciseDates: number
  readonly paths: number
  readonly seed: number
}

export interface DualBound {
  readonly lower: number
  readonly upper: number
}

function intrinsic(spot: number, strike: number, isCall: boolean): number {
  return isCall ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)
}

function regress(level: Float64Array, value: Float64Array, mask: boolean[]): number[] {
  const ata = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const aty = [0, 0, 0]
  let count = 0
  for (let p = 0; p < value.length; p += 1) {
    if (!mask[p]) continue
    count += 1
    const basis = [1, level[p], level[p] * level[p]]
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) ata[i][j] += basis[i] * basis[j]
      aty[i] += basis[i] * value[p]
    }
  }
  return count >= 3 ? solveLinearSystem(ata, aty) : [0, 0, 0]
}

function continuation(coefficients: number[], spot: number): number {
  return coefficients[0] + coefficients[1] * spot + coefficients[2] * spot * spot
}

export function bermudanDualBound(spec: BermudanDualSpec): DualBound {
  const steps = spec.exerciseDates
  const dt = spec.maturity / steps
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol) * dt
  const diffusion = spec.vol * Math.sqrt(dt)
  const generator = new MersenneTwister(spec.seed)

  const spots: Float64Array[] = []
  const logState = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  for (let k = 0; k < steps; k += 1) {
    const level = new Float64Array(spec.paths)
    for (let p = 0; p < spec.paths; p += 1) {
      logState[p] += drift + diffusion * inverseNormalCdf(generator.nextDouble())
      level[p] = Math.exp(logState[p])
    }
    spots.push(level)
  }

  const discounted = (value: number, step: number): number => value * Math.exp(-spec.rate * (step + 1) * dt)
  const allPaths = Array.from({ length: spec.paths }, () => true)
  const dualCoefficients: number[][] = new Array(steps)
  const value = new Float64Array(spec.paths)
  for (let p = 0; p < spec.paths; p += 1) value[p] = discounted(intrinsic(spots[steps - 1][p], spec.strike, spec.isCall), steps - 1)
  dualCoefficients[steps - 1] = [0, 0, 0]

  for (let k = steps - 2; k >= 0; k -= 1) {
    const level = spots[k]
    const inMoney = Array.from({ length: spec.paths }, (_, p) => intrinsic(level[p], spec.strike, spec.isCall) > 0)
    dualCoefficients[k] = regress(level, value, allPaths)
    const policy = regress(level, value, inMoney)
    for (let p = 0; p < spec.paths; p += 1) {
      const immediate = discounted(intrinsic(level[p], spec.strike, spec.isCall), k)
      if (inMoney[p] && immediate > continuation(policy, level[p])) value[p] = immediate
    }
  }

  let lower = 0
  for (let p = 0; p < spec.paths; p += 1) lower += value[p]
  lower /= spec.paths

  let upper = 0
  for (let p = 0; p < spec.paths; p += 1) {
    let martingale = 0
    let best = Number.NEGATIVE_INFINITY
    for (let k = 0; k < steps; k += 1) {
      const payoff = discounted(intrinsic(spots[k][p], spec.strike, spec.isCall), k)
      const valueFunction = k === steps - 1 ? payoff : Math.max(payoff, continuation(dualCoefficients[k], spots[k][p]))
      if (k > 0) martingale += valueFunction - continuation(dualCoefficients[k - 1], spots[k - 1][p])
      best = Math.max(best, payoff - martingale)
    }
    upper += best
  }
  upper /= spec.paths

  return { lower, upper }
}
