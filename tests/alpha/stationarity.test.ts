import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { adfTest, kpssTest, ljungBox, hurstExponent, halfLife } from '../../src/alpha/stationarity'
import { fixedWidthFracDiff } from '../../src/alpha/fracdiff'

const T = 800
const noise = Array.from(standardNormals(T, 7))

function randomWalk(seed: number): number[] {
  const steps = standardNormals(T, seed)
  const out: number[] = []
  let level = 0
  for (const z of steps) {
    level += z
    out.push(level)
  }
  return out
}

function ar1(phi: number, seed: number): number[] {
  const steps = standardNormals(T, seed)
  const out: number[] = []
  let level = 0
  for (const z of steps) {
    level = phi * level + z
    out.push(level)
  }
  return out
}

describe('adf test', () => {
  it('fails to reject a unit root on a random walk', () => {
    expect(adfTest(randomWalk(11)).stationary).toBe(false)
  })

  it('rejects the unit root on a stationary ar(1)', () => {
    const result = adfTest(ar1(0.5, 13))
    expect(result.stationary).toBe(true)
    expect(result.statistic).toBeLessThan(result.criticalValues.one)
  })

  it('works with augmentation lags and trend regressions', () => {
    expect(adfTest(ar1(0.5, 13), 3).stationary).toBe(true)
    expect(adfTest(randomWalk(11), 3, 'trend').stationary).toBe(false)
  })

  it('critical values tighten with sample size', () => {
    const short = adfTest(ar1(0.5, 13).slice(0, 50))
    const long = adfTest(ar1(0.5, 13))
    expect(short.criticalValues.five).toBeLessThan(long.criticalValues.five)
  })
})

describe('kpss test', () => {
  it('accepts stationarity for iid noise and rejects for a random walk', () => {
    expect(kpssTest(noise).stationary).toBe(true)
    expect(kpssTest(randomWalk(17)).stationary).toBe(false)
  })
})

describe('ljung-box', () => {
  it('finds no autocorrelation in iid noise and strong autocorrelation in ar(1)', () => {
    expect(ljungBox(noise).pValue).toBeGreaterThan(0.05)
    const dependent = ljungBox(ar1(0.7, 19))
    expect(dependent.pValue).toBeLessThan(0.01)
    expect(dependent.statistic).toBeGreaterThan(0)
    expect(dependent.degreesOfFreedom).toBe(10)
  })
})

describe('hurst exponent', () => {
  const iid = hurstExponent(noise, 10, 100)
  const longNoise = Array.from(standardNormals(3000, 37))
  const longMemory = hurstExponent(fixedWidthFracDiff(longNoise, -0.35, 0.01).slice(300), 10, 200)
  const antiPersistent = hurstExponent(
    noise.slice(1).map((x, i) => x - noise[i]),
    10,
    100,
  )

  it('is near one half for iid increments', () => {
    expect(Math.abs(iid - 0.5)).toBeLessThan(0.15)
  })

  it('orders long-memory above iid above over-differenced increments', () => {
    expect(longMemory).toBeGreaterThan(0.6)
    expect(antiPersistent).toBeLessThan(0.4)
    expect(longMemory).toBeGreaterThan(iid)
    expect(iid).toBeGreaterThan(antiPersistent)
  })
})

describe('half life', () => {
  it('matches the closed form on a deterministic decay', () => {
    const series = Array.from({ length: 60 }, (_, i) => 100 * 0.9 ** i)
    expect(halfLife(series)).toBeCloseTo(-Math.log(2) / Math.log(0.9), 6)
  })

  it('recovers the mean-reversion speed of a simulated ou process', () => {
    const phi = 0.9
    const series = ar1(phi, 31)
    const expected = -Math.log(2) / Math.log(phi)
    expect(Math.abs(halfLife(series) - expected)).toBeLessThan(2)
  })

  it('is infinite for a non-reverting series', () => {
    const trending = Array.from({ length: 100 }, (_, i) => Math.exp(0.01 * i))
    expect(halfLife(trending)).toBe(Infinity)
  })
})
