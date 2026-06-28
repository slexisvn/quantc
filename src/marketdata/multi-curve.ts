import { DiscountCurve } from './curve'

export interface FloatingSwap {
  readonly times: number[]
  readonly accruals: number[]
  readonly fixedRate: number
}

export function projectionForward(projection: DiscountCurve, start: number, end: number): number {
  return (projection.discountFactor(start) / projection.discountFactor(end) - 1) / (end - start)
}

export function floatingLegValue(swap: FloatingSwap, discount: DiscountCurve, projection: DiscountCurve): number {
  let value = 0
  let previous = 0
  for (let i = 0; i < swap.times.length; i += 1) {
    const forward = projectionForward(projection, previous, swap.times[i])
    value += swap.accruals[i] * forward * discount.discountFactor(swap.times[i])
    previous = swap.times[i]
  }
  return value
}

export function annuity(swap: FloatingSwap, discount: DiscountCurve): number {
  let total = 0
  for (let i = 0; i < swap.times.length; i += 1) total += swap.accruals[i] * discount.discountFactor(swap.times[i])
  return total
}

export function multiCurveSwapValue(swap: FloatingSwap, discount: DiscountCurve, projection: DiscountCurve): number {
  return floatingLegValue(swap, discount, projection) - swap.fixedRate * annuity(swap, discount)
}

export function multiCurveParRate(swap: FloatingSwap, discount: DiscountCurve, projection: DiscountCurve): number {
  return floatingLegValue(swap, discount, projection) / annuity(swap, discount)
}

export interface ProjectionQuote {
  readonly maturity: number
  readonly rate: number
}

export function bootstrapProjectionCurve(discount: DiscountCurve, quotes: readonly ProjectionQuote[], accrual: number): DiscountCurve {
  const times: number[] = []
  const zeroRates: number[] = []

  for (const quote of quotes) {
    const periods = Math.round(quote.maturity / accrual)
    const swapTimes = Array.from({ length: periods }, (_, i) => (i + 1) * accrual)
    const swapAccruals = swapTimes.map(() => accrual)
    const swap: FloatingSwap = { times: swapTimes, accruals: swapAccruals, fixedRate: quote.rate }

    let low = -0.02
    let high = 0.5
    for (let iteration = 0; iteration < 200; iteration += 1) {
      const mid = 0.5 * (low + high)
      times.push(quote.maturity)
      zeroRates.push(mid)
      const candidate = new DiscountCurve([...times], [...zeroRates])
      const par = multiCurveParRate(swap, discount, candidate)
      times.pop()
      zeroRates.pop()
      if (par > quote.rate) high = mid
      else low = mid
    }
    times.push(quote.maturity)
    zeroRates.push(0.5 * (low + high))
  }

  return new DiscountCurve(times, zeroRates)
}
