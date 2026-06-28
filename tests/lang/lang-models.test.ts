import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { printProduct } from '../../src/lang/printer'
import { priceProduct } from '../../src/lang/compile'
import { blackScholes, normalPdf } from '../../src/numerics/analytic/black-scholes'
import { priceMertonCall } from '../../src/models/equity/merton'

const PATHS = 100000
const HESTON_PATHS = 40000 // Heston refines to a fine grid; keep path counts modest
const SEED = 4242

const call = (model: string) => `
  product Vanilla {
    underlying S model ${model}
    param strike = 100
    event T = 1.0 { pay max(S(T) - strike, 0) at T }
  }
`

describe('Quill models — displaced diffusion reduces to GBM at shift 0', () => {
  it('prices identically to gbm with shift = 0 (same seed)', () => {
    const gbm = priceProduct(parseProduct(call('gbm')), { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    const displaced = priceProduct(parseProduct(call('displaced(shift = 0)')), { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    expect(Math.abs(displaced.price - gbm.price)).toBeLessThan(1e-9)
    expect(Math.abs(displaced.greeks.delta - gbm.greeks.delta)).toBeLessThan(1e-9)
  })
})

describe('Quill models — Heston collapses to GBM when vol-of-vol is zero', () => {
  it('with xi = 0 and v0 = theta = vol^2 it matches gbm(vol = sqrt(theta))', () => {
    // xi = 0 freezes the variance at theta, so Heston is GBM(0.2) in distribution;
    // it uses a finer simulation grid than the single-step GBM, so compare within MC error.
    const heston = parseProduct(call('heston(kappa = 2, theta = 0.04, xi = 0, rho = -0.7, v0 = 0.04)'))
    const gbm = parseProduct(call('gbm'))
    const hPrice = priceProduct(heston, { spot: 100, rate: 0.03 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    const gPrice = priceProduct(gbm, { spot: 100, rate: 0.03, vol: 0.2 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    expect(Math.abs(hPrice.price - gPrice.price)).toBeLessThan(0.3)
  })

  it('matches Black-Scholes(0.2) within Monte Carlo error', () => {
    const heston = parseProduct(call('heston(kappa = 2, theta = 0.04, xi = 0, rho = -0.7, v0 = 0.04)'))
    const result = priceProduct(heston, { spot: 100, rate: 0.03 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.3)
  })

  it('with vol-of-vol > 0 it stays finite and positive', () => {
    const heston = parseProduct(call('heston(kappa = 1.5, theta = 0.04, xi = 0.4, rho = -0.7, v0 = 0.04)'))
    const result = priceProduct(heston, { spot: 100, rate: 0.03 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    expect(result.price).toBeGreaterThan(0)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })
})

describe('Quill models — Merton jump-diffusion', () => {
  it('collapses to GBM when the jump intensity is zero', () => {
    const merton = parseProduct(call('merton(jumpIntensity = 0, jumpMean = -0.1, jumpVol = 0.15)'))
    const gbm = parseProduct(call('gbm'))
    const mPrice = priceProduct(merton, { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    const gPrice = priceProduct(gbm, { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    expect(Math.abs(mPrice.price - gPrice.price)).toBeLessThan(1e-9)
  })

  it('matches the reference Merton Monte Carlo price', () => {
    const merton = parseProduct(call('merton(jumpIntensity = 0.5, jumpMean = -0.1, jumpVol = 0.15)'))
    const result = priceProduct(merton, { spot: 100, rate: 0.03, vol: 0.2 }, 300000, SEED)
    const reference = priceMertonCall({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, jumpIntensity: 0.5, jumpMean: -0.1, jumpVol: 0.15, paths: 300000, seed: 999 })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.4)
  })

  it('keeps Greeks finite with jumps switched on', () => {
    const merton = parseProduct(call('merton(jumpIntensity = 0.8, jumpMean = -0.2, jumpVol = 0.25)'))
    const result = priceProduct(merton, { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    expect(result.price).toBeGreaterThan(0)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
    expect(Number.isFinite(result.greeks.vega)).toBe(true)
  })
})

describe('Quill models — Bachelier ATM closed form', () => {
  it('matches the normal-model ATM call price (rate 0)', () => {
    // Single step, r = 0: S_T ~ Normal(S0, vol^2). ATM call = vol*sqrt(T)*phi(0).
    const bachelier = parseProduct(call('bachelier'))
    const result = priceProduct(bachelier, { spot: 100, rate: 0, vol: 20 }, PATHS, SEED)
    const reference = 20 * normalPdf(0)
    expect(Math.abs(result.price - reference)).toBeLessThan(0.2)
  })
})

describe('Quill models — CEV local volatility', () => {
  it('beta = 0 reduces to the Bachelier (normal) model at zero rate', () => {
    const cev = parseProduct(call('cev(beta = 0)'))
    const result = priceProduct(cev, { spot: 100, rate: 0, vol: 20 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    const reference = 20 * normalPdf(0)
    expect(Math.abs(result.price - reference)).toBeLessThan(0.4)
  })

  it('beta = 1 reduces to lognormal (Black-Scholes) pricing', () => {
    const cev = parseProduct(call('cev(beta = 1)'))
    const result = priceProduct(cev, { spot: 100, rate: 0.03, vol: 0.2 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.4)
  })

  it('an intermediate beta prices positively with finite Greeks', () => {
    const cev = parseProduct(call('cev(beta = 0.5)'))
    const result = priceProduct(cev, { spot: 100, rate: 0.03, vol: 2 }, HESTON_PATHS, SEED, { greeks: 'price-only' })
    expect(result.price).toBeGreaterThan(0)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })
})

describe('Quill models — typecheck of model parameters', () => {
  it('treats an omitted model parameter as optional, resolved from the market', () => {
    const omitted = parseProduct(call('heston(kappa = 2, theta = 0.04, xi = 0.3, rho = -0.7)'))
    expect(checkProduct(omitted)).toEqual([])
    const market = { spot: 100, rate: 0.03, vol: 0.2 }
    expect(() => priceProduct(omitted, market, 2000, SEED, { greeks: 'price-only' })).toThrow(/missing model parameter 'v0'/)
    expect(() => priceProduct(omitted, { ...market, modelParams: { S: { v0: 0.04 } } }, 2000, SEED, { greeks: 'price-only' })).not.toThrow()
  })

  it('reports an unknown model parameter', () => {
    const errors = checkProduct(parseProduct(call('displaced(shift = 0, bogus = 1)')))
    expect(errors.some((e) => /has no parameter 'bogus'/.test(e.message))).toBe(true)
  })

  it('reports an unknown model', () => {
    const errors = checkProduct(parseProduct(call('sabr(alpha = 0.2)')))
    expect(errors.some((e) => /unknown model 'sabr'/.test(e.message))).toBe(true)
  })

  it('accepts a well-formed Heston declaration', () => {
    expect(checkProduct(parseProduct(call('heston(kappa = 2, theta = 0.04, xi = 0.3, rho = -0.7, v0 = 0.04)')))).toEqual([])
  })
})

describe('Quill models — parser/printer round-trip with model params', () => {
  it('prints model parameters and re-parses idempotently', () => {
    const source = call('heston(kappa = 1.5, theta = 0.04, xi = 0.3, rho = -0.7, v0 = 0.04)')
    const once = printProduct(parseProduct(source))
    expect(once).toContain('model heston(kappa = 1.5, theta = 0.04, xi = 0.3, rho = (-0.7), v0 = 0.04)')
    expect(printProduct(parseProduct(once))).toBe(once)
  })
})
