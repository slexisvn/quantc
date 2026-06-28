import { solveTridiagonal } from './pde/thomas'

export interface TwoAssetPdeSpec {
  readonly spot1: number
  readonly spot2: number
  readonly vol1: number
  readonly vol2: number
  readonly correlation: number
  readonly rate: number
  readonly maturity: number
  readonly gridPoints: number
  readonly timeSteps: number
  readonly widthStdDev: number
}

export function exchangeOptionAdi(spec: TwoAssetPdeSpec): number {
  const m = spec.gridPoints
  const dt = spec.maturity / spec.timeSteps
  const theta = 0.5

  const center1 = Math.log(spec.spot1)
  const center2 = Math.log(spec.spot2)
  const half1 = spec.widthStdDev * spec.vol1 * Math.sqrt(spec.maturity)
  const half2 = spec.widthStdDev * spec.vol2 * Math.sqrt(spec.maturity)
  const dx1 = (2 * half1) / (m - 1)
  const dx2 = (2 * half2) / (m - 1)

  const x1 = new Float64Array(m)
  const x2 = new Float64Array(m)
  for (let i = 0; i < m; i += 1) x1[i] = center1 - half1 + i * dx1
  for (let j = 0; j < m; j += 1) x2[j] = center2 - half2 + j * dx2

  const payoff = (i: number, j: number): number => Math.max(Math.exp(x1[i]) - Math.exp(x2[j]), 0)

  let value: number[][] = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => payoff(i, j)))

  const v1 = spec.vol1 * spec.vol1
  const v2 = spec.vol2 * spec.vol2
  const drift1 = spec.rate - 0.5 * v1
  const drift2 = spec.rate - 0.5 * v2
  const crossCoefficient = (spec.correlation * spec.vol1 * spec.vol2) / (4 * dx1 * dx2)

  const a1Sub = 0.5 * v1 / (dx1 * dx1) - drift1 / (2 * dx1)
  const a1Diag = -v1 / (dx1 * dx1) - 0.5 * spec.rate
  const a1Sup = 0.5 * v1 / (dx1 * dx1) + drift1 / (2 * dx1)
  const a2Sub = 0.5 * v2 / (dx2 * dx2) - drift2 / (2 * dx2)
  const a2Diag = -v2 / (dx2 * dx2) - 0.5 * spec.rate
  const a2Sup = 0.5 * v2 / (dx2 * dx2) + drift2 / (2 * dx2)

  const applyA1 = (grid: number[][], i: number, j: number): number => a1Sub * grid[i - 1][j] + a1Diag * grid[i][j] + a1Sup * grid[i + 1][j]
  const applyA2 = (grid: number[][], i: number, j: number): number => a2Sub * grid[i][j - 1] + a2Diag * grid[i][j] + a2Sup * grid[i][j + 1]
  const applyA0 = (grid: number[][], i: number, j: number): number => crossCoefficient * (grid[i + 1][j + 1] - grid[i + 1][j - 1] - grid[i - 1][j + 1] + grid[i - 1][j - 1])

  const interior = m - 2

  const lower = new Float64Array(interior)
  const diag = new Float64Array(interior)
  const upper = new Float64Array(interior)
  const rhs = new Float64Array(interior)

  for (let step = 0; step < spec.timeSteps; step += 1) {
    const fixed = value
    const a0v: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
    const a1v: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
    const a2v: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
    for (let i = 1; i <= interior; i += 1) {
      for (let j = 1; j <= interior; j += 1) {
        a0v[i][j] = applyA0(fixed, i, j)
        a1v[i][j] = applyA1(fixed, i, j)
        a2v[i][j] = applyA2(fixed, i, j)
      }
    }

    const sweep1 = (source: number[][]): number[][] => {
      const result = fixed.map((row) => row.slice())
      for (let j = 1; j <= interior; j += 1) {
        for (let i = 1; i <= interior; i += 1) {
          lower[i - 1] = -theta * dt * a1Sub
          diag[i - 1] = 1 - theta * dt * a1Diag
          upper[i - 1] = -theta * dt * a1Sup
          rhs[i - 1] = source[i][j] - theta * dt * a1v[i][j]
        }
        rhs[0] -= -theta * dt * a1Sub * fixed[0][j]
        rhs[interior - 1] -= -theta * dt * a1Sup * fixed[m - 1][j]
        const solved = solveTridiagonal(lower, diag, upper, rhs)
        for (let i = 1; i <= interior; i += 1) result[i][j] = solved[i - 1]
      }
      return result
    }

    const sweep2 = (source: number[][]): number[][] => {
      const result = fixed.map((row) => row.slice())
      for (let i = 1; i <= interior; i += 1) {
        for (let j = 1; j <= interior; j += 1) {
          lower[j - 1] = -theta * dt * a2Sub
          diag[j - 1] = 1 - theta * dt * a2Diag
          upper[j - 1] = -theta * dt * a2Sup
          rhs[j - 1] = source[i][j] - theta * dt * a2v[i][j]
        }
        rhs[0] -= -theta * dt * a2Sub * fixed[i][0]
        rhs[interior - 1] -= -theta * dt * a2Sup * fixed[i][m - 1]
        const solved = solveTridiagonal(lower, diag, upper, rhs)
        for (let j = 1; j <= interior; j += 1) result[i][j] = solved[j - 1]
      }
      return result
    }

    const y0 = fixed.map((row) => row.slice())
    for (let i = 1; i <= interior; i += 1) {
      for (let j = 1; j <= interior; j += 1) y0[i][j] = fixed[i][j] + dt * (a0v[i][j] + a1v[i][j] + a2v[i][j])
    }
    const y2 = sweep2(sweep1(y0))

    const corrected = y0.map((row) => row.slice())
    for (let i = 1; i <= interior; i += 1) {
      for (let j = 1; j <= interior; j += 1) corrected[i][j] = y0[i][j] + 0.5 * dt * (applyA0(y2, i, j) - a0v[i][j])
    }
    value = sweep2(sweep1(corrected))
  }

  const i0 = Math.round((center1 - (center1 - half1)) / dx1)
  const j0 = Math.round((center2 - (center2 - half2)) / dx2)
  return value[i0][j0]
}
