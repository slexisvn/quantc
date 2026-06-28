import { solveLinearSystem } from '../numerics/linalg/solve'
import { blackScholes } from '../numerics/analytic/black-scholes'

export interface LevenbergMarquardtOptions {
  readonly maxIterations: number
  readonly tolerance: number
  readonly initialDamping: number
}

export interface CalibrationResult {
  readonly parameters: number[]
  readonly residualNorm: number
  readonly iterations: number
}

const DEFAULT_OPTIONS: LevenbergMarquardtOptions = { maxIterations: 200, tolerance: 1e-12, initialDamping: 1e-3 }

function sumSquares(values: number[]): number {
  let total = 0
  for (const value of values) total += value * value
  return total
}

function jacobian(residual: (x: number[]) => number[], x: number[], base: number[]): number[][] {
  const m = base.length
  const n = x.length
  const result: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(0))
  for (let j = 0; j < n; j += 1) {
    const step = 1e-6 * Math.max(1, Math.abs(x[j]))
    const up = [...x]
    const down = [...x]
    up[j] += step
    down[j] -= step
    const fUp = residual(up)
    const fDown = residual(down)
    for (let i = 0; i < m; i += 1) result[i][j] = (fUp[i] - fDown[i]) / (2 * step)
  }
  return result
}

export function levenbergMarquardt(residual: (x: number[]) => number[], initial: number[], options: Partial<LevenbergMarquardtOptions> = {}): CalibrationResult {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const n = initial.length
  let x = [...initial]
  let residuals = residual(x)
  let cost = sumSquares(residuals)
  let damping = config.initialDamping
  let iterations = 0

  for (; iterations < config.maxIterations; iterations += 1) {
    const j = jacobian(residual, x, residuals)
    const m = residuals.length
    const jtj: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    const jtr = new Array<number>(n).fill(0)
    for (let a = 0; a < n; a += 1) {
      for (let b = 0; b < n; b += 1) {
        let sum = 0
        for (let i = 0; i < m; i += 1) sum += j[i][a] * j[i][b]
        jtj[a][b] = sum
      }
      let sumR = 0
      for (let i = 0; i < m; i += 1) sumR += j[i][a] * residuals[i]
      jtr[a] = sumR
    }

    let improved = false
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const system = jtj.map((row, i) => row.map((value, k) => (i === k ? value + damping * (value + 1e-12) : value)))
      const delta = solveLinearSystem(system, jtr.map((value) => -value))
      const candidate = x.map((value, i) => value + delta[i])
      const candidateResiduals = residual(candidate)
      const candidateCost = sumSquares(candidateResiduals)
      if (candidateCost < cost) {
        x = candidate
        const previousCost = cost
        residuals = candidateResiduals
        cost = candidateCost
        damping *= 0.7
        improved = true
        if (previousCost - candidateCost < config.tolerance) iterations += 1
        break
      }
      damping *= 2.5
    }
    if (!improved) break
    if (cost < config.tolerance) break
  }

  return { parameters: x, residualNorm: Math.sqrt(cost), iterations }
}

export interface ImpliedVolInputs {
  readonly price: number
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly maturity: number
  readonly isCall: boolean
}

export function impliedVolatility(input: ImpliedVolInputs): number {
  let vol = 0.2
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const valued = blackScholes({ spot: input.spot, strike: input.strike, rate: input.rate, vol, maturity: input.maturity, isCall: input.isCall })
    const diff = valued.price - input.price
    if (Math.abs(diff) < 1e-12) break
    if (valued.vega < 1e-12) break
    vol -= diff / valued.vega
    if (vol < 1e-6) vol = 1e-6
  }
  return vol
}
