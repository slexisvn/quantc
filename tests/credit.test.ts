import { describe, it, expect } from 'vitest'
import { bootstrapHazardCurve, cdsParSpread, type CdsQuote } from '../src/instruments/cds'
import { conditionalDefaultProbability } from '../src/models/credit/gaussian-copula'
import { trancheExpectedLoss, type CdoSpec } from '../src/models/credit/cdo'
import { normalPdf } from '../src/numerics/analytic/black-scholes'

describe('hazard-rate curve and CDS bootstrap', () => {
  const quotes: CdsQuote[] = [
    { maturity: 1, spread: 0.008 },
    { maturity: 3, spread: 0.011 },
    { maturity: 5, spread: 0.014 },
  ]
  const curve = bootstrapHazardCurve(quotes, 0.25, 0.4, 0.02)

  it('reprices the input CDS quotes to par', () => {
    for (const quote of quotes) {
      expect(cdsParSpread(curve, { maturity: quote.maturity, frequency: 0.25, recovery: 0.4, discountRate: 0.02 })).toBeCloseTo(quote.spread, 8)
    }
  })

  it('produces a monotone-decreasing survival probability', () => {
    let previous = 1
    for (const t of [0.5, 1, 2, 3, 4, 5]) {
      const survival = curve.survival(t)
      expect(survival).toBeLessThan(previous)
      previous = survival
    }
  })
})

describe('Gaussian copula', () => {
  it('integrates the conditional default probability back to the unconditional', () => {
    const pd = 0.05
    const correlation = 0.3
    const points = 4000
    const lower = -8
    const upper = 8
    const step = (upper - lower) / points
    let integral = 0
    for (let q = 0; q < points; q += 1) {
      const factor = lower + (q + 0.5) * step
      integral += normalPdf(factor) * conditionalDefaultProbability(pd, correlation, factor) * step
    }
    expect(integral).toBeCloseTo(pd, 4)
  })
})

describe('CDO tranches', () => {
  const base: CdoSpec = {
    names: 100,
    defaultProbability: 0.05,
    recovery: 0.4,
    correlation: 0.3,
    attachment: 0,
    detachment: 1,
    quadraturePoints: 200,
  }

  it('the full capital structure carries the expected pool loss', () => {
    const expectedLoss = trancheExpectedLoss(base)
    expect(expectedLoss).toBeCloseTo((1 - base.recovery) * base.defaultProbability, 4)
  })

  it('correlation lowers the equity tranche and raises the senior tranche', () => {
    const equityLow = trancheExpectedLoss({ ...base, attachment: 0, detachment: 0.03, correlation: 0.1 })
    const equityHigh = trancheExpectedLoss({ ...base, attachment: 0, detachment: 0.03, correlation: 0.5 })
    const seniorLow = trancheExpectedLoss({ ...base, attachment: 0.1, detachment: 1, correlation: 0.1 })
    const seniorHigh = trancheExpectedLoss({ ...base, attachment: 0.1, detachment: 1, correlation: 0.5 })
    expect(equityHigh).toBeLessThan(equityLow)
    expect(seniorHigh).toBeGreaterThan(seniorLow)
  })
})
