import { describe, it, expect } from 'vitest'
import { buildAmcPricer, type AmcSpec } from '../../src/xva/amc-exposure'
import { polynomialBasis } from '../../src/numerics/basis'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { priceBermudanLsm } from '../../src/engines/longstaff-schwartz'
import { bermudanDualBound } from '../../src/engines/bermudan-dual'

describe('AMC exposure', () => {
  it('a European AMC reproduces Black-Scholes across a spot grid', () => {
    const spec: AmcSpec = {
      spot: 100,
      strike: 100,
      rate: 0.03,
      vol: 0.2,
      maturity: 1,
      isCall: true,
      exerciseDates: 20,
      paths: 60000,
      seed: 20240703,
      basis: polynomialBasis(5),
      ridgeLambda: 1e-6,
      bermudan: false,
      quantity: 1,
    }
    const pricer = buildAmcPricer(spec)
    const node = 9
    const time = pricer.times[node]
    const remaining = spec.maturity - time
    for (const spot of [92, 100, 108]) {
      const amc = pricer.mtm(spot, time)
      const bs = blackScholes({ spot, strike: spec.strike, rate: spec.rate, vol: spec.vol, maturity: remaining, isCall: true }).price
      expect(amc).toBeCloseTo(bs, 0)
    }
  })

  it('a Bermudan AMC price at t=0 matches the Longstaff-Schwartz engine and stays below the dual upper bound', () => {
    const shared = { spot: 100, strike: 100, rate: 0.05, vol: 0.25, maturity: 1, isCall: false, exerciseDates: 20, paths: 40000, seed: 555 }
    const spec: AmcSpec = { ...shared, basis: polynomialBasis(3), ridgeLambda: 1e-6, bermudan: true, quantity: 1 }
    const pricer = buildAmcPricer(spec)
    const lsm = priceBermudanLsm(shared)
    const dual = bermudanDualBound(shared)
    expect(pricer.price0).toBeCloseTo(lsm, 1)
    expect(pricer.price0).toBeLessThanOrEqual(dual.upper + 1e-6)
  })
})
