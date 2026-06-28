import { normalCdf } from './black-scholes'

export interface MargrabeInputs {
  readonly spot1: number
  readonly spot2: number
  readonly vol1: number
  readonly vol2: number
  readonly correlation: number
  readonly maturity: number
}

export function margrabeExchange(input: MargrabeInputs): number {
  const vol = Math.sqrt(input.vol1 * input.vol1 + input.vol2 * input.vol2 - 2 * input.correlation * input.vol1 * input.vol2)
  const sqrtT = Math.sqrt(input.maturity)
  const d1 = (Math.log(input.spot1 / input.spot2) + 0.5 * vol * vol * input.maturity) / (vol * sqrtT)
  const d2 = d1 - vol * sqrtT
  return input.spot1 * normalCdf(d1) - input.spot2 * normalCdf(d2)
}
