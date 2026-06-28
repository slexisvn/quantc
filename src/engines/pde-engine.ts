import { solveTridiagonal } from './pde/thomas'

export interface PdeSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
  readonly american: boolean
  readonly spaceSteps: number
  readonly timeSteps: number
  readonly widthStdDev: number
  readonly rannacherSteps: number
  readonly localVol?: (spot: number) => number
}

export interface PdeResult {
  readonly price: number
  readonly delta: number
  readonly gamma: number
}

function payoffAt(logSpot: number, strike: number, isCall: boolean): number {
  const spot = Math.exp(logSpot)
  return isCall ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)
}

function boundary(logSpot: number, spec: PdeSpec, tau: number): number {
  const spot = Math.exp(logSpot)
  const discountedStrike = spec.strike * Math.exp(-spec.rate * tau)
  if (spec.isCall) return Math.max(spot - discountedStrike, 0)
  return Math.max(discountedStrike - spot, 0)
}

export function pricePde(spec: PdeSpec): PdeResult {
  const m = spec.spaceSteps
  const center = Math.log(spec.spot)
  const halfWidth = spec.widthStdDev * spec.vol * Math.sqrt(spec.maturity)
  const dx = (2 * halfWidth) / (m - 1)
  const dt = spec.maturity / spec.timeSteps

  const x = new Float64Array(m)
  for (let i = 0; i < m; i += 1) x[i] = center - halfWidth + i * dx

  let values = new Float64Array(m)
  for (let i = 0; i < m; i += 1) values[i] = payoffAt(x[i], spec.strike, spec.isCall)

  const interior = m - 2
  const subL = new Float64Array(m)
  const diagL = new Float64Array(m)
  const supL = new Float64Array(m)
  for (let i = 1; i <= interior; i += 1) {
    const nodeVol = spec.localVol === undefined ? spec.vol : spec.localVol(Math.exp(x[i]))
    const variance = nodeVol * nodeVol
    const drift = spec.rate - 0.5 * variance
    subL[i] = 0.5 * variance / (dx * dx) - drift / (2 * dx)
    diagL[i] = -variance / (dx * dx) - spec.rate
    supL[i] = 0.5 * variance / (dx * dx) + drift / (2 * dx)
  }

  const lower = new Float64Array(interior)
  const diag = new Float64Array(interior)
  const upper = new Float64Array(interior)
  const rhs = new Float64Array(interior)

  for (let step = 0; step < spec.timeSteps; step += 1) {
    const theta = step < spec.rannacherSteps ? 1 : 0.5
    const tauNext = (step + 1) * dt
    const leftNext = boundary(x[0], spec, tauNext)
    const rightNext = boundary(x[m - 1], spec, tauNext)

    for (let i = 1; i <= interior; i += 1) {
      lower[i - 1] = -theta * dt * subL[i]
      diag[i - 1] = 1 - theta * dt * diagL[i]
      upper[i - 1] = -theta * dt * supL[i]
      rhs[i - 1] = (1 - theta) * dt * subL[i] * values[i - 1] + (1 + (1 - theta) * dt * diagL[i]) * values[i] + (1 - theta) * dt * supL[i] * values[i + 1]
    }
    rhs[0] += theta * dt * subL[1] * leftNext
    rhs[interior - 1] += theta * dt * supL[interior] * rightNext

    const solved = solveTridiagonal(lower, diag, upper, rhs)
    const next = new Float64Array(m)
    next[0] = leftNext
    next[m - 1] = rightNext
    for (let i = 1; i <= interior; i += 1) next[i] = solved[i - 1]

    if (spec.american) {
      for (let i = 0; i < m; i += 1) {
        const intrinsic = payoffAt(x[i], spec.strike, spec.isCall)
        if (intrinsic > next[i]) next[i] = intrinsic
      }
    }
    values = next
  }

  const j = Math.round((center - (center - halfWidth)) / dx)
  const delta = (values[j + 1] - values[j - 1]) / (2 * dx) / spec.spot
  const valueXX = (values[j + 1] - 2 * values[j] + values[j - 1]) / (dx * dx)
  const valueX = (values[j + 1] - values[j - 1]) / (2 * dx)
  const gamma = (valueXX - valueX) / (spec.spot * spec.spot)
  return { price: values[j], delta, gamma }
}
