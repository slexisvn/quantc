export interface Dividend {
  readonly time: number
  readonly amount: number
}

export function equityForward(spot: number, rate: number, maturity: number, dividends: readonly Dividend[]): number {
  let presentValue = 0
  for (const dividend of dividends) {
    if (dividend.time <= maturity) presentValue += dividend.amount * Math.exp(-rate * dividend.time)
  }
  return (spot - presentValue) * Math.exp(rate * maturity)
}

export function equityForwardWithYield(spot: number, rate: number, dividendYield: number, maturity: number): number {
  return spot * Math.exp((rate - dividendYield) * maturity)
}
