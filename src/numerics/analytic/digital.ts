import { normalCdf, normalPdf } from './black-scholes'

export interface DigitalInputs {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
}

function d2Of(input: DigitalInputs): number {
  const sqrtT = Math.sqrt(input.maturity)
  return (Math.log(input.spot / input.strike) + (input.rate - 0.5 * input.vol * input.vol) * input.maturity) / (input.vol * sqrtT)
}

export function digitalCallPrice(input: DigitalInputs): number {
  return Math.exp(-input.rate * input.maturity) * normalCdf(d2Of(input))
}

export function digitalCallDelta(input: DigitalInputs): number {
  const sqrtT = Math.sqrt(input.maturity)
  return (Math.exp(-input.rate * input.maturity) * normalPdf(d2Of(input))) / (input.spot * input.vol * sqrtT)
}
