import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { intrinsic } from '../numerics/analytic/payoff'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { ridgeRegression } from '../alpha/regression'
import { evaluateBasis, type Basis } from '../numerics/basis'
import type { Trade } from '../risk/exposure'

export interface AmcSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly exerciseDates: number
  readonly paths: number
  readonly seed: number
  readonly basis: Basis
  readonly ridgeLambda: number
  readonly bermudan: boolean
  readonly quantity: number
}

function simulate(spec: AmcSpec): { times: number[]; levels: Float64Array[] } {
  const steps = spec.exerciseDates
  const dt = spec.maturity / steps
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol) * dt
  const diffusion = spec.vol * Math.sqrt(dt)
  const generator = new MersenneTwister(spec.seed)
  const logState = new Float64Array(spec.paths).fill(Math.log(spec.spot))
  const levels: Float64Array[] = []
  const times: number[] = []
  for (let step = 0; step < steps; step += 1) {
    const level = new Float64Array(spec.paths)
    for (let p = 0; p < spec.paths; p += 1) {
      logState[p] += drift + diffusion * inverseNormalCdf(generator.nextDouble())
      level[p] = Math.exp(logState[p])
    }
    levels.push(level)
    times.push((step + 1) * dt)
  }
  return { times, levels }
}

function regressNode(spec: AmcSpec, level: Float64Array, value: Float64Array): number[] {
  const design: number[][] = new Array(spec.paths)
  const response: number[] = new Array(spec.paths)
  for (let p = 0; p < spec.paths; p += 1) {
    design[p] = spec.basis.evaluate(level[p] / spec.strike)
    response[p] = value[p]
  }
  return ridgeRegression(design, response, spec.ridgeLambda)
}

export interface AmcPricer {
  readonly times: number[]
  readonly coefficients: number[][]
  readonly price0: number
  mtm(spot: number, time: number): number
}

export function buildAmcPricer(spec: AmcSpec): AmcPricer {
  const steps = spec.exerciseDates
  const dt = spec.maturity / steps
  const stepDiscount = Math.exp(-spec.rate * dt)
  const { times, levels } = simulate(spec)

  const value = new Float64Array(spec.paths)
  const last = levels[steps - 1]
  for (let p = 0; p < spec.paths; p += 1) value[p] = intrinsic(last[p], spec.strike, spec.isCall)

  const coefficients: number[][] = new Array(steps)
  coefficients[steps - 1] = regressNode(spec, last, value)

  for (let step = steps - 2; step >= 0; step -= 1) {
    for (let p = 0; p < spec.paths; p += 1) value[p] *= stepDiscount
    const level = levels[step]
    const coefficient = regressNode(spec, level, value)
    coefficients[step] = coefficient
    if (spec.bermudan) {
      for (let p = 0; p < spec.paths; p += 1) {
        const exercise = intrinsic(level[p], spec.strike, spec.isCall)
        if (exercise <= 0) continue
        const continuation = evaluateBasis(spec.basis, coefficient, level[p] / spec.strike)
        if (exercise > continuation) value[p] = exercise
      }
    }
  }

  let sumValue = 0
  for (let p = 0; p < spec.paths; p += 1) sumValue += value[p]
  const price0 = (sumValue / spec.paths) * stepDiscount

  const mtm = (spot: number, time: number): number => {
    if (time <= 0) return spec.quantity * price0
    if (time >= spec.maturity) return spec.quantity * intrinsic(spot, spec.strike, spec.isCall)
    let node = 0
    let bestDistance = Infinity
    for (let k = 0; k < times.length; k += 1) {
      const distance = Math.abs(times[k] - time)
      if (distance < bestDistance) {
        bestDistance = distance
        node = k
      }
    }
    const continuation = evaluateBasis(spec.basis, coefficients[node], spot / spec.strike)
    const holding = spec.bermudan ? Math.max(intrinsic(spot, spec.strike, spec.isCall), continuation) : continuation
    return spec.quantity * holding
  }

  return { times, coefficients, price0, mtm }
}

export function amcTrade(spec: AmcSpec): Trade {
  const pricer = buildAmcPricer(spec)
  return { mtm: pricer.mtm }
}
