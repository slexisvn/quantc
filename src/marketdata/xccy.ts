import { DiscountCurve } from './curve'

export function fxForward(spot: number, domesticDiscount: number, foreignDiscount: number): number {
  return (spot * foreignDiscount) / domesticDiscount
}

export function csaPresentValue(amount: number, time: number, collateral: DiscountCurve): number {
  return amount * collateral.discountFactor(time)
}

export function basisAdjustedCurve(base: DiscountCurve, basisSpread: number): DiscountCurve {
  return new DiscountCurve([...base.times], base.zeroRates.map((rate) => rate + basisSpread))
}

export interface CrossCurrencySwapLeg {
  readonly times: number[]
  readonly accruals: number[]
  readonly rate: number
  readonly notional: number
}

export function crossCurrencyLegValue(leg: CrossCurrencySwapLeg, collateral: DiscountCurve): number {
  let value = 0
  for (let i = 0; i < leg.times.length; i += 1) value += leg.rate * leg.accruals[i] * leg.notional * collateral.discountFactor(leg.times[i])
  const maturity = leg.times[leg.times.length - 1]
  value += leg.notional * collateral.discountFactor(maturity)
  return value
}
