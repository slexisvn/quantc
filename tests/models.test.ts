import { describe, it, expect } from 'vitest'
import { priceHestonCall } from '../src/models/equity/heston'
import { zeroCouponBond, convexityAdjustment, type VasicekSpec } from '../src/models/rates/hull-white'
import { sabrImpliedVol } from '../src/models/fx/sabr'
import { pricePde, type PdeSpec } from '../src/engines/pde-engine'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

describe('Heston (equity stochastic vol)', () => {
  it('collapses to Black-Scholes when vol-of-vol vanishes', () => {
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const heston = priceHestonCall({
      spot: 100, strike: 100, rate: 0.03, maturity: 1,
      initialVariance: 0.04, longVariance: 0.04, meanReversion: 1.5, volOfVol: 1e-6, correlation: 0,
      steps: 100, paths: 120000, seed: 555,
    })
    expect(Math.abs(heston.price - reference.price)).toBeLessThan(0.1)
  })
})

describe('Hull-White / Vasicek (rates)', () => {
  const spec: VasicekSpec = { shortRate: 0.03, meanReversion: 0.1, longRate: 0.05, vol: 0.01, maturity: 5 }
  it('produces a discount factor in (0,1) with positive convexity adjustment', () => {
    const bond = zeroCouponBond(spec)
    expect(bond).toBeGreaterThan(0)
    expect(bond).toBeLessThan(1)
    expect(convexityAdjustment(spec)).toBeGreaterThan(0)
  })
  it('discounts more heavily at longer maturities', () => {
    const near = zeroCouponBond({ ...spec, maturity: 2 })
    const far = zeroCouponBond({ ...spec, maturity: 10 })
    expect(far).toBeLessThan(near)
  })
})

describe('SABR (FX/vol smile)', () => {
  it('at-the-money lognormal vol is close to alpha when beta=1 and vol-of-vol is small', () => {
    const atm = sabrImpliedVol({ forward: 1.2, strike: 1.2, maturity: 1, alpha: 0.15, beta: 1, rho: 0, volOfVol: 1e-4 })
    expect(Math.abs(atm - 0.15)).toBeLessThan(1e-3)
  })
  it('produces a positive smile away from the money', () => {
    const wing = sabrImpliedVol({ forward: 1.2, strike: 1.4, maturity: 1, alpha: 0.15, beta: 0.5, rho: -0.3, volOfVol: 0.4 })
    expect(wing).toBeGreaterThan(0)
  })
})

describe('Local volatility PDE', () => {
  const base: PdeSpec = {
    spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1,
    isCall: true, american: false, spaceSteps: 401, timeSteps: 200, widthStdDev: 6, rannacherSteps: 4,
  }
  it('constant local vol reproduces the constant-vol price', () => {
    const constant = pricePde(base)
    const local = pricePde({ ...base, localVol: () => 0.2 })
    expect(Math.abs(local.price - constant.price)).toBeLessThan(1e-6)
  })
  it('a downward-sloping local vol changes the price', () => {
    const local = pricePde({ ...base, localVol: (spot) => 0.2 + 0.1 * (100 - spot) / 100 })
    expect(Math.abs(local.price - pricePde(base).price)).toBeGreaterThan(1e-3)
  })
})
