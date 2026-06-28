import type { VolSurface } from './vol-surface'

export function localVariance(surface: VolSurface, k: number, maturity: number): number {
  const w = surface.totalVariance(k, maturity)
  const wt = surface.dTotalVarianceDt(k, maturity)
  const wk = surface.dTotalVarianceDk(k, maturity)
  const wkk = surface.d2TotalVarianceDk(k, maturity)
  const denominator = 1 - (k * wk) / (2 * w) + 0.25 * (-0.25 - 1 / w + (k * k) / (w * w)) * wk * wk + 0.5 * wkk
  return wt / denominator
}

export function localVol(surface: VolSurface, strike: number, forward: number, maturity: number): number {
  const k = Math.log(strike / forward)
  return Math.sqrt(localVariance(surface, k, maturity))
}
