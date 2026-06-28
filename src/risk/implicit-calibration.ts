import { solveLinearSystem } from '../numerics/linalg/solve'

export type CalibrationResidual = (theta: number[], quotes: number[]) => number[]

function jacobian(evaluate: (x: number[]) => number[], x: number[], rows: number): number[][] {
  const columns = x.length
  const result: number[][] = Array.from({ length: rows }, () => new Array<number>(columns).fill(0))
  for (let j = 0; j < columns; j += 1) {
    const step = 1e-6 * Math.max(1, Math.abs(x[j]))
    const up = [...x]
    const down = [...x]
    up[j] += step
    down[j] -= step
    const fUp = evaluate(up)
    const fDown = evaluate(down)
    for (let i = 0; i < rows; i += 1) result[i][j] = (fUp[i] - fDown[i]) / (2 * step)
  }
  return result
}

export function parameterQuoteSensitivity(residual: CalibrationResidual, theta: number[], quotes: number[]): number[][] {
  const n = theta.length
  const m = quotes.length
  const jTheta = jacobian((t) => residual(t, quotes), theta, n)
  const jQuote = jacobian((q) => residual(theta, q), quotes, n)

  const sensitivity: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))
  for (let j = 0; j < m; j += 1) {
    const rhs = new Array<number>(n)
    for (let i = 0; i < n; i += 1) rhs[i] = -jQuote[i][j]
    const solution = solveLinearSystem(jTheta.map((row) => [...row]), rhs)
    for (let i = 0; i < n; i += 1) sensitivity[i][j] = solution[i]
  }
  return sensitivity
}

export function priceQuoteSensitivity(priceParameterGradient: number[], parameterQuoteJacobian: number[][]): number[] {
  const m = parameterQuoteJacobian[0].length
  const result = new Array<number>(m).fill(0)
  for (let j = 0; j < m; j += 1) {
    for (let i = 0; i < priceParameterGradient.length; i += 1) result[j] += priceParameterGradient[i] * parameterQuoteJacobian[i][j]
  }
  return result
}
