import type { Product } from './ast'
import { priceProduct, type ProductMarket, type ProductPricingResult, type PricingOptions } from './compile'
import { calibrateHeston, type VanillaQuote, type HestonCalibrationResult } from '../calibration/heston-calibration'

export interface HestonCalibrationConfig {
  readonly quotes: readonly VanillaQuote[]
  readonly meanReversion: number
  readonly correlation: number
  readonly initial: { readonly initialVariance: number; readonly longVariance: number; readonly volOfVol: number }
}

export interface CalibratedPricing {
  readonly result: ProductPricingResult
  readonly calibration: HestonCalibrationResult
  readonly modelParams: Readonly<Record<string, number>>
}

export function calibrateHestonAndPrice(
  product: Product,
  market: ProductMarket,
  config: HestonCalibrationConfig,
  paths: number,
  seed: number,
  options: PricingOptions = {},
): CalibratedPricing {
  const hestonUnderlying = product.underlyings.find((u) => u.model === 'heston')
  if (hestonUnderlying === undefined) throw new Error('calibrateHestonAndPrice requires an underlying with model heston')

  const spot = market.spots?.[hestonUnderlying.name] ?? market.spot
  if (spot === undefined) throw new Error(`missing spot for underlying '${hestonUnderlying.name}'`)

  const calibration = calibrateHeston(spot, market.rate, config.quotes, { meanReversion: config.meanReversion, correlation: config.correlation }, config.initial)

  const modelParams = {
    kappa: config.meanReversion,
    theta: calibration.longVariance,
    xi: calibration.volOfVol,
    rho: config.correlation,
    v0: calibration.initialVariance,
  }
  const calibratedMarket: ProductMarket = {
    ...market,
    modelParams: { ...market.modelParams, [hestonUnderlying.name]: { ...market.modelParams?.[hestonUnderlying.name], ...modelParams } },
  }

  return { result: priceProduct(product, calibratedMarket, paths, seed, options), calibration, modelParams }
}
