import { solveTridiagonal } from './pde/thomas'
import { logSpaceGrid } from './pde/grid'

export interface MertonPideSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly jumpIntensity: number
  readonly jumpMean: number
  readonly jumpVol: number
  readonly spaceSteps: number
  readonly timeSteps: number
  readonly widthStdDev: number
  readonly quadraturePoints: number
}

export function mertonPideCall(spec: MertonPideSpec): number {
  const m = spec.spaceSteps
  const dt = spec.maturity / spec.timeSteps
  const effectiveVol = Math.sqrt(spec.vol * spec.vol + spec.jumpIntensity * (spec.jumpMean * spec.jumpMean + spec.jumpVol * spec.jumpVol))
  const { nodes: x, dx, centerIndex: j } = logSpaceGrid(spec.spot, effectiveVol, spec.maturity, spec.widthStdDev, m)

  const kappa = Math.exp(spec.jumpMean + 0.5 * spec.jumpVol * spec.jumpVol) - 1
  const drift = spec.rate - 0.5 * spec.vol * spec.vol - spec.jumpIntensity * kappa

  const jumpHalf = spec.widthStdDev * spec.jumpVol + Math.abs(spec.jumpMean)
  const dy = (2 * jumpHalf) / (spec.quadraturePoints - 1)
  const y = new Float64Array(spec.quadraturePoints)
  const weight = new Float64Array(spec.quadraturePoints)
  let weightSum = 0
  for (let q = 0; q < spec.quadraturePoints; q += 1) {
    y[q] = -jumpHalf + q * dy
    const standardized = (y[q] - spec.jumpMean) / spec.jumpVol
    weight[q] = Math.exp(-0.5 * standardized * standardized) / (spec.jumpVol * Math.sqrt(2 * Math.PI)) * dy
    weightSum += weight[q]
  }
  for (let q = 0; q < spec.quadraturePoints; q += 1) weight[q] /= weightSum

  let values = new Float64Array(m)
  for (let i = 0; i < m; i += 1) values[i] = Math.max(Math.exp(x[i]) - spec.strike, 0)

  const interpolate = (grid: Float64Array, point: number): number => {
    if (point <= x[0]) return grid[0]
    if (point >= x[m - 1]) return Math.max(Math.exp(point) - spec.strike, 0)
    const position = (point - x[0]) / dx
    const lower = Math.floor(position)
    const frac = position - lower
    return grid[lower] * (1 - frac) + grid[lower + 1] * frac
  }

  const variance = spec.vol * spec.vol
  const subL = 0.5 * variance / (dx * dx) - drift / (2 * dx)
  const diagL = -variance / (dx * dx) - (spec.rate + spec.jumpIntensity)
  const supL = 0.5 * variance / (dx * dx) + drift / (2 * dx)

  const interior = m - 2
  const lower = new Float64Array(interior)
  const diag = new Float64Array(interior)
  const upper = new Float64Array(interior)
  const rhs = new Float64Array(interior)

  for (let step = 0; step < spec.timeSteps; step += 1) {
    const tau = (step + 1) * dt
    const leftBoundary = 0
    const rightBoundary = Math.exp(x[m - 1]) - spec.strike * Math.exp(-spec.rate * tau)

    const jump = new Float64Array(m)
    for (let i = 1; i <= interior; i += 1) {
      let integral = 0
      for (let q = 0; q < spec.quadraturePoints; q += 1) integral += interpolate(values, x[i] + y[q]) * weight[q]
      jump[i] = integral
    }

    for (let i = 1; i <= interior; i += 1) {
      lower[i - 1] = -dt * subL
      diag[i - 1] = 1 - dt * diagL
      upper[i - 1] = -dt * supL
      rhs[i - 1] = values[i] + dt * spec.jumpIntensity * jump[i]
    }
    rhs[0] += dt * subL * leftBoundary
    rhs[interior - 1] += dt * supL * rightBoundary

    const solved = solveTridiagonal(lower, diag, upper, rhs)
    const next = new Float64Array(m)
    next[0] = leftBoundary
    next[m - 1] = rightBoundary
    for (let i = 1; i <= interior; i += 1) next[i] = solved[i - 1]
    values = next
  }

  return values[j]
}
