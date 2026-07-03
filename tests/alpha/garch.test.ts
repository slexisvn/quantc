import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { fitGarch, garchVariances, garchForecast, garchLogLikelihood, garchVolTarget, type GarchParams } from '../../src/alpha/garch'
import { ewmaVolatility } from '../../src/alpha/sizing'
import { meanStd } from '../../src/alpha/util'
import type { Matrix } from '../../src/alpha/types'

const trueParams: GarchParams = { omega: 2e-6, alpha: 0.08, beta: 0.9 }

function simulateGarch(t: number, seed: number, params: GarchParams): number[] {
  const normals = standardNormals(t, seed)
  const out: number[] = []
  let variance = params.omega / (1 - params.alpha - params.beta)
  for (let i = 0; i < t; i += 1) {
    const r = Math.sqrt(variance) * normals[i]
    out.push(r)
    variance = params.omega + params.alpha * r * r + params.beta * variance
  }
  return out
}

const returns = simulateGarch(4000, 71, trueParams)

describe('garch estimation', () => {
  const fit = fitGarch(returns, { seed: 3 })

  it('recovers the simulated parameters with variance targeting', () => {
    expect(Math.abs(fit.params.alpha - trueParams.alpha)).toBeLessThan(0.05)
    expect(Math.abs(fit.params.beta - trueParams.beta)).toBeLessThan(0.05)
    expect(fit.persistence).toBeLessThan(1)
    expect(fit.unconditionalVariance).toBeGreaterThan(0)
  })

  it('the fitted likelihood beats perturbed parameters', () => {
    const worse: GarchParams = { omega: fit.params.omega * 4, alpha: fit.params.alpha, beta: fit.params.beta * 0.8 }
    expect(fit.logLikelihood).toBeGreaterThan(garchLogLikelihood(returns, worse))
  })
})

describe('garch recursion', () => {
  it('reduces to ewma when omega is zero and weights sum to one', () => {
    const lambda = 0.94
    const params: GarchParams = { omega: 0, alpha: 1 - lambda, beta: lambda }
    const sample = returns.slice(0, 200)
    const variances = garchVariances(sample, params, sample[0] * sample[0])
    const ewma = ewmaVolatility(sample, lambda)
    for (let i = 0; i + 1 < sample.length; i += 1) {
      expect(variances[i + 1]).toBeCloseTo(ewma[i] * ewma[i], 12)
    }
  })

  it('forecast converges monotonically to the unconditional variance', () => {
    const horizon = 400
    const forecast = garchForecast(returns, trueParams, horizon)
    const unconditional = trueParams.omega / (1 - trueParams.alpha - trueParams.beta)
    expect(Math.abs(forecast[horizon - 1] - unconditional) / unconditional).toBeLessThan(0.01)
    const distances = forecast.map((v) => Math.abs(v - unconditional))
    for (let h = 1; h < horizon; h += 1) expect(distances[h]).toBeLessThanOrEqual(distances[h - 1] + 1e-18)
  })
})

describe('garch vol targeting', () => {
  const t = 600
  const switchAt = 300
  const normals = standardNormals(t, 77)
  const assetReturns: Matrix = Array.from({ length: t }, (_, i) => [(i < switchAt ? 0.005 : 0.03) * normals[i]])
  const weights: Matrix = Array.from({ length: t }, () => [1])

  function realizedVol(w: Matrix): number {
    const port: number[] = []
    for (let i = 1; i < t; i += 1) port.push(w[i - 1][0] * assetReturns[i][0])
    return meanStd(port).std * Math.sqrt(252)
  }

  it('tracks the target better than unscaled weights and stays causal', () => {
    const target = 0.1
    const params = fitGarch(
      assetReturns.map((row) => row[0]),
      { seed: 5 },
    ).params
    const scaled = garchVolTarget(weights, assetReturns, target, params)
    expect(Math.abs(realizedVol(scaled) - target)).toBeLessThan(Math.abs(realizedVol(weights) - target))
    const cutoff = 350
    const perturbed = assetReturns.map((row, i) => (i > cutoff ? [row[0] * 5] : row.slice()))
    const shifted = garchVolTarget(weights, perturbed, target, params)
    for (let i = 0; i <= cutoff; i += 1) expect(shifted[i][0]).toBe(scaled[i][0])
  })
})
