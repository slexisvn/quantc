import { normalCdf } from './black-scholes'

export interface GeometricAsianInputs {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly fixings: number
}

export function geometricAsianCall(input: GeometricAsianInputs): number {
  const { spot, strike, rate, vol, maturity, fixings } = input
  const dt = maturity / fixings

  let timeSum = 0
  let covariance = 0
  for (let k = 0; k < fixings; k += 1) {
    const tk = (k + 1) * dt
    timeSum += tk
    covariance += tk * (2 * (fixings - k) - 1)
  }

  const muG = Math.log(spot) + ((rate - 0.5 * vol * vol) / fixings) * timeSum
  const varG = (vol * vol / (fixings * fixings)) * covariance
  const sigmaG = Math.sqrt(varG)

  const d1 = (muG - Math.log(strike) + varG) / sigmaG
  const d2 = d1 - sigmaG
  const expectation = Math.exp(muG + 0.5 * varG) * normalCdf(d1) - strike * normalCdf(d2)
  return Math.exp(-rate * maturity) * expectation
}
