import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { Tape, variable, constant, gradientOf } from '../aad/tape'
import { solveLinearSystem } from '../numerics/linalg/solve'
import type { Basis } from '../numerics/basis'

export interface DmlSpec {
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly samples: number
  readonly spotMin: number
  readonly spotMax: number
  readonly seed: number
}

export interface TrainingSet {
  readonly spots: number[]
  readonly payoffs: number[]
  readonly differentials: number[]
}

export function generateBlackScholesTrainingSet(spec: DmlSpec): TrainingSet {
  const generator = new MersenneTwister(spec.seed)
  const spots: number[] = new Array(spec.samples)
  const payoffs: number[] = new Array(spec.samples)
  const differentials: number[] = new Array(spec.samples)
  const discount = Math.exp(-spec.rate * spec.maturity)
  for (let i = 0; i < spec.samples; i += 1) {
    const spot = spec.spotMin + (spec.spotMax - spec.spotMin) * generator.nextDouble()
    const z = inverseNormalCdf(generator.nextDouble())
    const growth = Math.exp((spec.rate - 0.5 * spec.vol * spec.vol) * spec.maturity + spec.vol * Math.sqrt(spec.maturity) * z)
    const tape = new Tape()
    const spotVar = variable(tape, spot)
    const terminal = spotVar.mul(constant(tape, growth))
    const zero = constant(tape, 0)
    const intrinsic = spec.isCall ? terminal.sub(constant(tape, spec.strike)).max(zero) : constant(tape, spec.strike).sub(terminal).max(zero)
    const discounted = intrinsic.mul(constant(tape, discount))
    spots[i] = spot
    payoffs[i] = discounted.value
    differentials[i] = gradientOf(tape, discounted, [spotVar])[0]
  }
  return { spots, payoffs, differentials }
}

export interface PricingProxy {
  price(spot: number): number
  delta(spot: number): number
}

function basisDerivative(basis: Basis, spot: number): number[] {
  if (basis.derivative === undefined) throw new Error('basis does not expose an analytic derivative')
  return basis.derivative(spot)
}

export function fitDifferentialRidge(training: TrainingSet, basis: Basis, differentialWeight: number, lambda: number): PricingProxy {
  const m = basis.size
  const a: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  const b: number[] = new Array<number>(m).fill(0)
  for (let i = 0; i < training.spots.length; i += 1) {
    const phi = basis.evaluate(training.spots[i])
    const dphi = basisDerivative(basis, training.spots[i])
    for (let r = 0; r < m; r += 1) {
      b[r] += phi[r] * training.payoffs[i] + differentialWeight * dphi[r] * training.differentials[i]
      for (let c = 0; c < m; c += 1) a[r][c] += phi[r] * phi[c] + differentialWeight * dphi[r] * dphi[c]
    }
  }
  for (let r = 0; r < m; r += 1) a[r][r] += lambda
  const beta = solveLinearSystem(a, b)
  return {
    price(spot) {
      const phi = basis.evaluate(spot)
      let value = 0
      for (let r = 0; r < m; r += 1) value += phi[r] * beta[r]
      return value
    },
    delta(spot) {
      const dphi = basisDerivative(basis, spot)
      let value = 0
      for (let r = 0; r < m; r += 1) value += dphi[r] * beta[r]
      return value
    },
  }
}
