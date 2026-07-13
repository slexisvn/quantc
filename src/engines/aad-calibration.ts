import { Tape, ANumber, variable, gradientOf } from '../aad/tape'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { sumSquares } from '../numerics/vector'
import type { LevenbergMarquardtOptions, CalibrationResult } from './calibration'

export type TapeResidual = (parameters: ANumber[], tape: Tape) => ANumber[]

const DEFAULT_OPTIONS: LevenbergMarquardtOptions = { maxIterations: 200, tolerance: 1e-12, initialDamping: 1e-3 }

export function evaluateResidualJacobian(model: TapeResidual, x: number[]): { residuals: number[]; jacobian: number[][] } {
  const tape = new Tape()
  const parameters = x.map((value) => variable(tape, value))
  const residuals = model(parameters, tape)
  return {
    residuals: residuals.map((residual) => residual.value),
    jacobian: residuals.map((residual) => gradientOf(tape, residual, parameters)),
  }
}

export function aadLevenbergMarquardt(model: TapeResidual, initial: number[], options: Partial<LevenbergMarquardtOptions> = {}): CalibrationResult {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const n = initial.length
  let x = [...initial]
  let evaluation = evaluateResidualJacobian(model, x)
  let residuals = evaluation.residuals
  let cost = sumSquares(residuals)
  let damping = config.initialDamping
  let iterations = 0

  for (; iterations < config.maxIterations; iterations += 1) {
    const j = evaluation.jacobian
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
      const candidateEvaluation = evaluateResidualJacobian(model, candidate)
      const candidateCost = sumSquares(candidateEvaluation.residuals)
      if (candidateCost < cost) {
        x = candidate
        const previousCost = cost
        evaluation = candidateEvaluation
        residuals = candidateEvaluation.residuals
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
