import { levenbergMarquardt } from '../engines/calibration'
import { hestonCf } from '../analytics/characteristic'
import { cosEuropeanPrice } from '../analytics/cos-method'

export interface VanillaQuote {
  readonly strike: number
  readonly maturity: number
  readonly price: number
}

export interface HestonFixed {
  readonly meanReversion: number
  readonly correlation: number
}

export interface HestonCalibrationResult {
  readonly initialVariance: number
  readonly longVariance: number
  readonly volOfVol: number
  readonly residualNorm: number
}

export function calibrateHeston(spot: number, rate: number, quotes: readonly VanillaQuote[], fixed: HestonFixed, initial: { initialVariance: number; longVariance: number; volOfVol: number }): HestonCalibrationResult {
  const residual = (p: number[]): number[] =>
    quotes.map((quote) => {
      const model = hestonCf(rate, quote.maturity, {
        initialVariance: p[0],
        meanReversion: fixed.meanReversion,
        longVariance: p[1],
        volOfVol: p[2],
        correlation: fixed.correlation,
      })
      return cosEuropeanPrice(model, spot, quote.strike, rate, quote.maturity, true) - quote.price
    })

  const result = levenbergMarquardt(residual, [initial.initialVariance, initial.longVariance, initial.volOfVol], { maxIterations: 300 })
  return { initialVariance: result.parameters[0], longVariance: result.parameters[1], volOfVol: result.parameters[2], residualNorm: result.residualNorm }
}
