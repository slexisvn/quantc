import { describe, it, expect } from 'vitest'
import { deltaRiskCharge, vegaRiskCharge, curvatureRiskCharge, standardisedCapital, defaultRiskCharge } from '../src/risk/frtb'
import { blackScholes } from '../src/numerics/analytic/black-scholes'
import { stressedVar } from '../src/risk/stressed-var'
import { parametricVar } from '../src/risk/var'
import { incrementalRiskCharge, type IrcSpec } from '../src/risk/irc'
import { attributePnl } from '../src/risk/pnl-attribution'

describe('FRTB standardised approach', () => {
  const sensitivities = [
    { bucket: 1, sensitivity: 1000, riskWeight: 0.015 },
    { bucket: 1, sensitivity: -400, riskWeight: 0.015 },
    { bucket: 2, sensitivity: 600, riskWeight: 0.02 },
  ]
  const correlations = { withinBucket: 0.6, acrossBucket: 0.3 }

  it('is positive and homogeneous of degree one in sensitivities', () => {
    const charge = deltaRiskCharge(sensitivities, correlations)
    expect(charge).toBeGreaterThan(0)
    const doubled = deltaRiskCharge(sensitivities.map((s) => ({ ...s, sensitivity: 2 * s.sensitivity })), correlations)
    expect(doubled).toBeCloseTo(2 * charge, 6)
  })

  it('produces a non-negative default risk charge', () => {
    expect(defaultRiskCharge([{ jtd: 1000, riskWeight: 0.08 }, { jtd: -300, riskWeight: 0.08 }])).toBeGreaterThanOrEqual(0)
  })

  it('curvature charge captures option convexity and the total capital sums the components', () => {
    const shock = 0.1
    const base = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const up = blackScholes({ spot: 100 * (1 + shock), strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const down = blackScholes({ spot: 100 * (1 - shock), strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const cvrUp = -(up.price - base.price - shock * 100 * base.delta)
    const cvrDown = -(down.price - base.price + shock * 100 * base.delta)
    const curvature = curvatureRiskCharge([{ bucket: 1, cvrUp, cvrDown }], correlations)
    expect(curvature).toBeGreaterThan(0)

    const delta = deltaRiskCharge(sensitivities, correlations)
    const vega = vegaRiskCharge([{ bucket: 1, sensitivity: base.vega, riskWeight: 0.55 }], correlations)
    expect(standardisedCapital(delta, vega, curvature, 0)).toBeCloseTo(delta + vega + curvature, 9)
  })
})

describe('stressed VaR', () => {
  it('exceeds the unstressed VaR under a stress multiplier', () => {
    const covariance = [
      [0.04, 0.01],
      [0.01, 0.09],
    ]
    const sensitivities = [1, -0.5]
    const base = parametricVar(sensitivities, covariance, 0.99)
    expect(stressedVar(sensitivities, covariance, 0.99, 1.5)).toBeCloseTo(1.5 * base, 6)
    expect(stressedVar(sensitivities, covariance, 0.99, 1.5)).toBeGreaterThan(base)
  })
})

describe('incremental risk charge', () => {
  const base: IrcSpec = {
    obligors: Array.from({ length: 50 }, () => ({ defaultProbability: 0.02, exposure: 1, lossGivenDefault: 0.6 })),
    correlation: 0.2,
    confidence: 0.999,
    scenarios: 40000,
    seed: 17,
  }

  it('is positive and increases with default probability and correlation', () => {
    expect(incrementalRiskCharge(base)).toBeGreaterThan(0)
    const higherPd = incrementalRiskCharge({ ...base, obligors: base.obligors.map((o) => ({ ...o, defaultProbability: 0.05 })) })
    expect(higherPd).toBeGreaterThan(incrementalRiskCharge(base))
    const higherCorr = incrementalRiskCharge({ ...base, correlation: 0.6 })
    expect(higherCorr).toBeGreaterThan(incrementalRiskCharge(base))
  })
})

describe('P&L attribution', () => {
  it('explains the realised P&L of a small move via the Greeks', () => {
    const attribution = attributePnl({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true, spotMove: 1, volMove: 0.01, timeMove: 0.004 })
    expect(Math.abs(attribution.unexplained)).toBeLessThan(0.02 * Math.abs(attribution.actual) + 0.01)
    expect(Math.abs(attribution.delta)).toBeGreaterThan(Math.abs(attribution.gamma))
  })
})
