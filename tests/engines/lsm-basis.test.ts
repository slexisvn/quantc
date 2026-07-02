import { describe, it, expect } from 'vitest'
import { priceBermudanLsm, type BermudanSpec } from '../../src/engines/longstaff-schwartz'
import { bermudanDualBound } from '../../src/engines/bermudan-dual'
import { laguerreBasis, polynomialBasis } from '../../src/numerics/basis'

const spec: BermudanSpec = { spot: 100, strike: 100, rate: 0.05, vol: 0.25, maturity: 1, isCall: false, exerciseDates: 40, paths: 40000, seed: 7777 }

describe('Longstaff-Schwartz basis option', () => {
  const legacy = priceBermudanLsm(spec)

  it('reproduces the legacy price exactly when no basis is supplied', () => {
    expect(priceBermudanLsm(spec)).toBe(legacy)
  })

  it('matches the legacy quadratic basis to floating tolerance when passed explicitly', () => {
    const explicit = priceBermudanLsm({ ...spec, basis: polynomialBasis(2), ridgeLambda: 0 })
    expect(Math.abs(explicit - legacy)).toBeLessThan(1e-3)
  })

  it('a Laguerre basis with ridge tracks the dual upper bound and stays close to the legacy price', () => {
    const dual = bermudanDualBound(spec)
    const laguerre = priceBermudanLsm({ ...spec, basis: laguerreBasis(3), ridgeLambda: 1e-6 })
    expect(laguerre).toBeLessThanOrEqual(dual.upper + 0.05)
    expect(Math.abs(laguerre - legacy)).toBeLessThan(0.1)
  })
})
