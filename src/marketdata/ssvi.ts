export interface SsviParams {
  readonly rho: number
  readonly eta: number
  readonly gamma: number
}

export function ssviTotalVariance(k: number, atmVariance: number, params: SsviParams): number {
  const phi = params.eta / Math.pow(atmVariance, params.gamma)
  const term = phi * k + params.rho
  return 0.5 * atmVariance * (1 + params.rho * phi * k + Math.sqrt(term * term + (1 - params.rho * params.rho)))
}

export function ssviImpliedVol(k: number, maturity: number, atmVariance: number, params: SsviParams): number {
  return Math.sqrt(ssviTotalVariance(k, atmVariance, params) / maturity)
}

export function calendarArbitrageFree(kGrid: readonly number[], nearVariance: number, farVariance: number, params: SsviParams): boolean {
  if (farVariance < nearVariance) return false
  for (const k of kGrid) {
    if (ssviTotalVariance(k, farVariance, params) < ssviTotalVariance(k, nearVariance, params) - 1e-12) return false
  }
  return true
}
