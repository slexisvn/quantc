import { DiscountCurve } from './curve'

export interface ParSwapQuote {
  readonly maturity: number
  readonly rate: number
}

export function bootstrapFromParSwaps(quotes: readonly ParSwapQuote[], accrual: number): DiscountCurve {
  const times: number[] = []
  const discountFactors: number[] = []

  for (const quote of quotes) {
    const periods = Math.round(quote.maturity / accrual)
    let annuity = 0
    for (let i = 0; i < discountFactors.length; i += 1) annuity += accrual * discountFactors[i]
    const discountFactor = (1 - quote.rate * annuity) / (1 + quote.rate * accrual)
    times.push(periods * accrual)
    discountFactors.push(discountFactor)
  }

  const zeroRates = discountFactors.map((df, i) => -Math.log(df) / times[i])
  return new DiscountCurve(times, zeroRates)
}
