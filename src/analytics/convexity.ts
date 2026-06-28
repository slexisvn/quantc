function swapAnnuity(rate: number, tenor: number): number {
  return (1 - 1 / Math.pow(1 + rate, tenor)) / rate
}

export function cmsConvexityAdjustment(swapRate: number, vol: number, expiry: number, tenor: number): number {
  const h = 1e-5
  const base = swapAnnuity(swapRate, tenor)
  const up = swapAnnuity(swapRate + h, tenor)
  const down = swapAnnuity(swapRate - h, tenor)
  const firstDerivative = (up - down) / (2 * h)
  const secondDerivative = (up - 2 * base + down) / (h * h)
  return -0.5 * vol * vol * swapRate * swapRate * expiry * (secondDerivative / firstDerivative)
}

export function quantoForward(forward: number, assetVol: number, fxVol: number, correlation: number, maturity: number): number {
  return forward * Math.exp(-correlation * assetVol * fxVol * maturity)
}
