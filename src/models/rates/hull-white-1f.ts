import { normalCdf } from '../../numerics/analytic/black-scholes'
import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import type { DiscountCurve } from '../../marketdata/curve'

export interface HullWhiteSpec {
  readonly curve: DiscountCurve
  readonly meanReversion: number
  readonly vol: number
}

function bFactor(a: number, tenor: number): number {
  return (1 - Math.exp(-a * tenor)) / a
}

function instantaneousForward(curve: DiscountCurve, t: number): number {
  const h = 1e-4
  const left = Math.max(t - h, 1e-8)
  const right = t + h
  return (Math.log(curve.discountFactor(left)) - Math.log(curve.discountFactor(right))) / (right - left)
}

function alpha(spec: HullWhiteSpec, t: number): number {
  const a = spec.meanReversion
  return instantaneousForward(spec.curve, t) + (spec.vol * spec.vol) / (2 * a * a) * (1 - Math.exp(-a * t)) * (1 - Math.exp(-a * t))
}

export function hullWhiteBond(spec: HullWhiteSpec, t: number, maturity: number, shortRate: number): number {
  const a = spec.meanReversion
  const b = bFactor(a, maturity - t)
  const ratio = spec.curve.discountFactor(maturity) / spec.curve.discountFactor(t)
  const logA = Math.log(ratio) + b * instantaneousForward(spec.curve, t) - (spec.vol * spec.vol) / (4 * a) * (1 - Math.exp(-2 * a * t)) * b * b
  return Math.exp(logA - b * shortRate)
}

function zeroBondPut(spec: HullWhiteSpec, expiry: number, bondMaturity: number, strike: number): number {
  const a = spec.meanReversion
  const sigmaP = spec.vol * bFactor(a, bondMaturity - expiry) * Math.sqrt((1 - Math.exp(-2 * a * expiry)) / (2 * a))
  const pBond = spec.curve.discountFactor(bondMaturity)
  const pExpiry = spec.curve.discountFactor(expiry)
  const h = Math.log(pBond / (strike * pExpiry)) / sigmaP + 0.5 * sigmaP
  return strike * pExpiry * normalCdf(-h + sigmaP) - pBond * normalCdf(-h)
}

export interface HullWhiteSwaption {
  readonly expiry: number
  readonly times: number[]
  readonly accruals: number[]
  readonly fixedRate: number
}

function couponFlows(swaption: HullWhiteSwaption): number[] {
  return swaption.accruals.map((accrual, i) => (i === swaption.accruals.length - 1 ? 1 + swaption.fixedRate * accrual : swaption.fixedRate * accrual))
}

function couponBond(spec: HullWhiteSpec, swaption: HullWhiteSwaption, flows: number[], shortRate: number): number {
  let value = 0
  for (let i = 0; i < swaption.times.length; i += 1) value += flows[i] * hullWhiteBond(spec, swaption.expiry, swaption.times[i], shortRate)
  return value
}

export function hullWhitePayerSwaption(spec: HullWhiteSpec, swaption: HullWhiteSwaption): number {
  const flows = couponFlows(swaption)
  let low = -1
  let high = 1
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const mid = 0.5 * (low + high)
    if (couponBond(spec, swaption, flows, mid) > 1) low = mid
    else high = mid
  }
  const criticalRate = 0.5 * (low + high)

  let price = 0
  for (let i = 0; i < swaption.times.length; i += 1) {
    const strike = hullWhiteBond(spec, swaption.expiry, swaption.times[i], criticalRate)
    price += flows[i] * zeroBondPut(spec, swaption.expiry, swaption.times[i], strike)
  }
  return price
}

export function hullWhitePayerSwaptionMc(spec: HullWhiteSpec, swaption: HullWhiteSwaption, steps: number, paths: number, seed: number): number {
  const a = spec.meanReversion
  const dt = swaption.expiry / steps
  const decay = Math.exp(-a * dt)
  const stepStd = spec.vol * Math.sqrt((1 - Math.exp(-2 * a * dt)) / (2 * a))
  const flows = couponFlows(swaption)
  const generator = new MersenneTwister(seed)

  let total = 0
  for (let p = 0; p < paths; p += 1) {
    let x = 0
    let integral = 0
    for (let step = 0; step < steps; step += 1) {
      const time = step * dt
      integral += (x + alpha(spec, time)) * dt
      x = x * decay + stepStd * inverseNormalCdf(generator.nextDouble())
    }
    const shortRate = x + alpha(spec, swaption.expiry)
    const swapValue = 1 - couponBond(spec, swaption, flows, shortRate)
    total += Math.exp(-integral) * Math.max(swapValue, 0)
  }
  return total / paths
}
