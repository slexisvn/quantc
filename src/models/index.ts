import { models } from './model-registry'
import { gbm } from './equity/gbm'

let registered = false

export function registerBuiltinModels(): void {
  if (registered) return
  models.register(gbm)
  registered = true
}

export { priceHestonCall } from './equity/heston'
export type { HestonSpec, HestonResult } from './equity/heston'
export { zeroCouponBond, convexityAdjustment } from './rates/hull-white'
export type { VasicekSpec } from './rates/hull-white'
export { sabrImpliedVol } from './fx/sabr'
export type { SabrSpec } from './fx/sabr'
