import { describe, it, expect } from 'vitest'
import { factorRegression, factorRiskAttribution, pcaFactors } from '../../src/alpha/factor'
import { informationCoefficient, rankInformationCoefficient, icSeries, informationRatioOfIC, combineSignals } from '../../src/alpha/ic'
import type { Matrix } from '../../src/alpha/types'

describe('factor model', () => {
  it('recovers alpha and beta of a one-factor relationship', () => {
    const factor: Matrix = Array.from({ length: 60 }, (_, i) => [0.01 * Math.sin(i)])
    const asset = factor.map((f) => 0.001 + 0.5 * f[0])
    const fit = factorRegression(asset, factor)
    expect(fit.alpha).toBeCloseTo(0.001, 6)
    expect(fit.betas[0]).toBeCloseTo(0.5, 6)
    expect(fit.rSquared).toBeCloseTo(1, 6)
  })

  it('risk attribution splits factor and specific risk', () => {
    const attribution = factorRiskAttribution([1, 0.5], [[0.04, 0], [0, 0.09]], 0.01)
    expect(attribution.total).toBeCloseTo(Math.sqrt(0.04 + 0.25 * 0.09 + 0.01), 9)
  })

  it('PCA factors are ordered by explained variance summing to at most one', () => {
    const returns: Matrix = Array.from({ length: 80 }, (_, i) => [Math.sin(i), Math.sin(i) + 0.1 * Math.cos(i), 0.05 * Math.cos(i)])
    const pca = pcaFactors(returns, 2)
    expect(pca.explained[0]).toBeGreaterThanOrEqual(pca.explained[1])
    expect(pca.explained.reduce((s, x) => s + x, 0)).toBeLessThanOrEqual(1 + 1e-9)
  })
})

describe('IC / IR analytics', () => {
  it('perfectly aligned signal has unit IC and rank IC', () => {
    expect(informationCoefficient([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 9)
    expect(rankInformationCoefficient([1, 2, 3, 4], [10, 20, 25, 40])).toBeCloseTo(1, 9)
  })

  it('IC series and IR of IC are finite', () => {
    const signal: Matrix = Array.from({ length: 30 }, (_, i) => [Math.sin(i), Math.cos(i)])
    const returns: Matrix = Array.from({ length: 30 }, (_, i) => [Math.sin(i + 1), Math.cos(i + 1)])
    const series = icSeries(signal, returns, 1, true)
    expect(series.length).toBe(29)
    expect(Number.isFinite(informationRatioOfIC(series))).toBe(true)
  })

  it('combineSignals returns the panel shape', () => {
    const a: Matrix = [[1, -1], [2, -2]]
    const b: Matrix = [[-1, 1], [-2, 2]]
    const combined = combineSignals([a, b])
    expect(combined.length).toBe(2)
    expect(combined[0].length).toBe(2)
  })
})
