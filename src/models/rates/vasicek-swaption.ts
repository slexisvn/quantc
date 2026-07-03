import { normalCdf } from '../../numerics/analytic/black-scholes'
import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { affineBFactor, affineCouponFlows } from './common'

export interface VasicekModel {
  readonly shortRate: number
  readonly meanReversion: number
  readonly longRate: number
  readonly vol: number
}

export function discountBond(model: VasicekModel, rate: number, t: number, maturity: number): number {
  const a = model.meanReversion
  const tenor = maturity - t
  const b = affineBFactor(a, tenor)
  const logA = (b - tenor) * (a * a * model.longRate - 0.5 * model.vol * model.vol) / (a * a) - (model.vol * model.vol * b * b) / (4 * a)
  return Math.exp(logA - b * rate)
}

function bondOptionVol(model: VasicekModel, expiry: number, bondMaturity: number): number {
  const a = model.meanReversion
  return model.vol * Math.sqrt((1 - Math.exp(-2 * a * expiry)) / (2 * a)) * affineBFactor(a, bondMaturity - expiry)
}

export function zeroBondPut(model: VasicekModel, expiry: number, bondMaturity: number, strike: number): number {
  const pBond = discountBond(model, model.shortRate, 0, bondMaturity)
  const pExpiry = discountBond(model, model.shortRate, 0, expiry)
  const sigma = bondOptionVol(model, expiry, bondMaturity)
  const h = Math.log(pBond / (strike * pExpiry)) / sigma + 0.5 * sigma
  return strike * pExpiry * normalCdf(-h + sigma) - pBond * normalCdf(-h)
}

export interface Swaption {
  readonly expiry: number
  readonly times: number[]
  readonly accruals: number[]
  readonly fixedRate: number
}

function couponBond(model: VasicekModel, rate: number, swaption: Swaption, flows: number[]): number {
  let value = 0
  for (let i = 0; i < swaption.times.length; i += 1) value += flows[i] * discountBond(model, rate, swaption.expiry, swaption.times[i])
  return value
}

export function jamshidianPayerSwaption(model: VasicekModel, swaption: Swaption): number {
  const flows = affineCouponFlows(swaption.accruals, swaption.fixedRate)
  let low = -1
  let high = 1
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const mid = 0.5 * (low + high)
    if (couponBond(model, mid, swaption, flows) > 1) low = mid
    else high = mid
  }
  const criticalRate = 0.5 * (low + high)

  let price = 0
  for (let i = 0; i < swaption.times.length; i += 1) {
    const strike = discountBond(model, criticalRate, swaption.expiry, swaption.times[i])
    price += flows[i] * zeroBondPut(model, swaption.expiry, swaption.times[i], strike)
  }
  return price
}

export function monteCarloPayerSwaption(model: VasicekModel, swaption: Swaption, steps: number, paths: number, seed: number): number {
  const dt = swaption.expiry / steps
  const a = model.meanReversion
  const flows = affineCouponFlows(swaption.accruals, swaption.fixedRate)
  const generator = new MersenneTwister(seed)

  let total = 0
  for (let p = 0; p < paths; p += 1) {
    let rate = model.shortRate
    let integral = 0
    for (let step = 0; step < steps; step += 1) {
      integral += rate * dt
      rate += a * (model.longRate - rate) * dt + model.vol * Math.sqrt(dt) * inverseNormalCdf(generator.nextDouble())
    }
    const swapValue = 1 - couponBond(model, rate, swaption, flows)
    total += Math.exp(-integral) * Math.max(swapValue, 0)
  }
  return total / paths
}
