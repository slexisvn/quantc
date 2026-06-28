import { levenbergMarquardt } from './calibration'
import { sabrImpliedVol } from '../models/fx/sabr'

export interface SabrQuote {
  readonly strike: number
  readonly vol: number
}

export interface SabrCalibrationInputs {
  readonly forward: number
  readonly maturity: number
  readonly beta: number
  readonly quotes: readonly SabrQuote[]
  readonly initialAlpha: number
  readonly initialRho: number
  readonly initialVolOfVol: number
}

export interface SabrParameters {
  readonly alpha: number
  readonly rho: number
  readonly volOfVol: number
  readonly residualNorm: number
}

export function calibrateSabr(input: SabrCalibrationInputs): SabrParameters {
  const residual = (p: number[]): number[] =>
    input.quotes.map((quote) =>
      sabrImpliedVol({ forward: input.forward, strike: quote.strike, maturity: input.maturity, alpha: p[0], beta: input.beta, rho: p[1], volOfVol: p[2] }) - quote.vol,
    )

  const result = levenbergMarquardt(residual, [input.initialAlpha, input.initialRho, input.initialVolOfVol])
  return { alpha: result.parameters[0], rho: result.parameters[1], volOfVol: result.parameters[2], residualNorm: result.residualNorm }
}
