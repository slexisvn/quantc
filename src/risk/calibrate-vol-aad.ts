import { priceEuropean, type EuropeanSpec } from '../engines/mc-engine'

export interface VolCalibrationResult {
  readonly vol: number
  readonly iterations: number
  readonly priceError: number
}

export function calibrateVolToPrice(spec: EuropeanSpec, targetPrice: number): VolCalibrationResult {
  let vol = 0.2
  let iterations = 0
  let priceError = Number.POSITIVE_INFINITY

  for (; iterations < 50; iterations += 1) {
    const valued = priceEuropean({ ...spec, vol })
    priceError = valued.price - targetPrice
    if (Math.abs(priceError) < 1e-7) break
    if (Math.abs(valued.greeks.vega) < 1e-10) break
    vol -= priceError / valued.greeks.vega
    if (vol < 1e-4) vol = 1e-4
  }

  return { vol, iterations, priceError }
}
