import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { fractionalKelly, ewmaVolatility, ewmaVolTarget, drawdownControl } from '../../src/alpha/sizing'
import { meanStd } from '../../src/alpha/util'
import type { Matrix } from '../../src/alpha/types'

describe('sizing', () => {
  it('fractional kelly matches the closed form', () => {
    expect(fractionalKelly(0.1, 0.04, 1)).toBeCloseTo(2.5, 12)
    expect(fractionalKelly(0.1, 0.04)).toBeCloseTo(1.25, 12)
    expect(fractionalKelly(0.1, 0)).toBe(0)
  })

  it('ewma volatility matches the recursive definition', () => {
    const returns = [0.01, -0.02, 0.005, 0.03]
    const lambda = 0.9
    const vol = ewmaVolatility(returns, lambda)
    let variance = returns[0] ** 2
    expect(vol[0]).toBeCloseTo(Math.sqrt(variance), 12)
    for (let i = 1; i < returns.length; i += 1) {
      variance = lambda * variance + (1 - lambda) * returns[i] ** 2
      expect(vol[i]).toBeCloseTo(Math.sqrt(variance), 12)
    }
  })

  const t = 500
  const switchAt = 250
  const normals = standardNormals(t, 41)
  const returns: Matrix = Array.from({ length: t }, (_, i) => [(i < switchAt ? 0.005 : 0.03) * normals[i]])
  const weights: Matrix = Array.from({ length: t }, () => [1])

  function realizedVol(w: Matrix): number {
    const port: number[] = []
    for (let i = 1; i < t; i += 1) port.push(w[i - 1][0] * returns[i][0])
    return meanStd(port).std * Math.sqrt(252)
  }

  it('ewma vol targeting tracks the target better than unscaled weights', () => {
    const target = 0.1
    const scaled = ewmaVolTarget(weights, returns, target)
    expect(Math.abs(realizedVol(scaled) - target)).toBeLessThan(Math.abs(realizedVol(weights) - target))
  })

  it('ewma vol targeting is causal', () => {
    const cutoff = 300
    const perturbed = returns.map((row, i) => (i > cutoff ? [row[0] * 5] : row.slice()))
    const baseScaled = ewmaVolTarget(weights, returns, 0.1)
    const shifted = ewmaVolTarget(weights, perturbed, 0.1)
    for (let i = 0; i <= cutoff; i += 1) expect(shifted[i][0]).toBe(baseScaled[i][0])
  })

  it('drawdown control cuts exposure after a breach and restores at new highs', () => {
    const portReturns = [0.05, 0.05, -0.3, 0.01, 0.6]
    const scales = drawdownControl(portReturns, 0.2, 0.25)
    expect(scales[0]).toBe(1)
    expect(scales[1]).toBe(1)
    expect(scales[2]).toBe(0.25)
    expect(scales[3]).toBeLessThan(1)
    expect(scales[4]).toBe(1)
  })
})
