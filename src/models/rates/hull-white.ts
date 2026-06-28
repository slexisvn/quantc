export interface VasicekSpec {
  readonly shortRate: number
  readonly meanReversion: number
  readonly longRate: number
  readonly vol: number
  readonly maturity: number
}

function integratedMean(spec: VasicekSpec): number {
  const { shortRate, meanReversion, longRate, maturity } = spec
  return longRate * maturity + ((shortRate - longRate) * (1 - Math.exp(-meanReversion * maturity))) / meanReversion
}

function integratedVariance(spec: VasicekSpec): number {
  const { meanReversion, vol, maturity } = spec
  const a = meanReversion
  return (vol * vol / (a * a)) * (maturity - (2 * (1 - Math.exp(-a * maturity))) / a + (1 - Math.exp(-2 * a * maturity)) / (2 * a))
}

export function zeroCouponBond(spec: VasicekSpec): number {
  return Math.exp(-integratedMean(spec) + 0.5 * integratedVariance(spec))
}

export function convexityAdjustment(spec: VasicekSpec): number {
  return 0.5 * integratedVariance(spec)
}
