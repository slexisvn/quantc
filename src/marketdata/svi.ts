import { levenbergMarquardt } from '../engines/calibration'

export interface SviParams {
  readonly a: number
  readonly b: number
  readonly rho: number
  readonly m: number
  readonly sigma: number
}

export function totalVariance(params: SviParams, k: number): number {
  const d = k - params.m
  return params.a + params.b * (params.rho * d + Math.sqrt(d * d + params.sigma * params.sigma))
}

export function dTotalVariance(params: SviParams, k: number): number {
  const d = k - params.m
  return params.b * (params.rho + d / Math.sqrt(d * d + params.sigma * params.sigma))
}

export function d2TotalVariance(params: SviParams, k: number): number {
  const d = k - params.m
  const root = Math.sqrt(d * d + params.sigma * params.sigma)
  return (params.b * params.sigma * params.sigma) / (root * root * root)
}

export function sviImpliedVol(params: SviParams, k: number, maturity: number): number {
  return Math.sqrt(totalVariance(params, k) / maturity)
}

export function butterflyG(params: SviParams, k: number): number {
  const w = totalVariance(params, k)
  const wp = dTotalVariance(params, k)
  const wpp = d2TotalVariance(params, k)
  const term = 1 - (k * wp) / (2 * w)
  return term * term - (wp * wp / 4) * (1 / w + 0.25) + wpp / 2
}

export function fitSvi(logMoneyness: number[], vols: number[], maturity: number, initial: SviParams): { params: SviParams; residualNorm: number } {
  const residual = (p: number[]): number[] =>
    logMoneyness.map((k, i) => sviImpliedVol({ a: p[0], b: p[1], rho: p[2], m: p[3], sigma: p[4] }, k, maturity) - vols[i])
  const result = levenbergMarquardt(residual, [initial.a, initial.b, initial.rho, initial.m, initial.sigma], { maxIterations: 400 })
  const [a, b, rho, m, sigma] = result.parameters
  return { params: { a, b, rho, m, sigma }, residualNorm: result.residualNorm }
}
