import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { almgrenChriss } from '../../src/alpha/almgren'
import { capacitySweep } from '../../src/alpha/capacity'
import type { Matrix } from '../../src/alpha/types'

describe('almgren-chriss', () => {
  const base = { totalShares: 1e6, periods: 10, volatility: 0.02, temporaryImpact: 1e-6, permanentImpact: 5e-7 }

  it('zero risk aversion executes as a uniform twap', () => {
    const { trades, holdings } = almgrenChriss({ ...base, riskAversion: 0 })
    trades.forEach((trade) => expect(trade).toBeCloseTo(base.totalShares / base.periods, 6))
    expect(holdings[0]).toBeCloseTo(base.totalShares, 8)
    expect(holdings[base.periods]).toBeCloseTo(0, 8)
  })

  it('risk aversion front-loads the schedule monotonically', () => {
    const { trades, holdings, kappa } = almgrenChriss({ ...base, riskAversion: 1e-5 })
    expect(kappa).toBeGreaterThan(0)
    for (let t = 1; t < trades.length; t += 1) expect(trades[t]).toBeLessThan(trades[t - 1])
    for (let t = 1; t < holdings.length; t += 1) expect(holdings[t]).toBeLessThan(holdings[t - 1])
    expect(holdings[0]).toBeCloseTo(base.totalShares, 6)
    expect(holdings[base.periods]).toBeCloseTo(0, 6)
  })

  it('a more aggressive schedule trades expected cost against variance', () => {
    const patient = almgrenChriss({ ...base, riskAversion: 0 })
    const urgent = almgrenChriss({ ...base, riskAversion: 1e-5 })
    expect(urgent.expectedCost).toBeGreaterThan(patient.expectedCost)
    expect(urgent.costVariance).toBeLessThan(patient.costVariance)
  })
})

describe('capacity sweep', () => {
  const t = 300
  const n = 4
  const rng = new MersenneTwister(13)
  const returns: Matrix = Array.from({ length: t }, () => Array.from({ length: n }, () => (rng.nextDouble() - 0.48) * 0.02))
  const weights: Matrix = Array.from({ length: t }, (_, i) => Array.from({ length: n }, (_, j) => ((i + j) % 2 === 0 ? 0.5 : -0.5)))
  const adv = Array.from({ length: n }, () => 1e7)

  it('net sharpe declines monotonically with aum', () => {
    const aums = [0, 1e6, 1e8, 1e10]
    const points = capacitySweep(weights, returns, aums, { adv, impactCoefficient: 0.05, linearRate: 0.0002 })
    for (let i = 1; i < points.length; i += 1) expect(points[i].netSharpe).toBeLessThanOrEqual(points[i - 1].netSharpe + 1e-12)
    expect(points[0].grossSharpe).toBe(points[3].grossSharpe)
    expect(points[3].costDrag).toBeGreaterThan(points[0].costDrag)
  })

  it('zero aum pays only the linear cost', () => {
    const [zero] = capacitySweep(weights, returns, [0], { adv, impactCoefficient: 0.05, linearRate: 0 })
    expect(zero.netSharpe).toBeCloseTo(zero.grossSharpe, 10)
  })
})
