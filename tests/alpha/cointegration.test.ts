import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { engleGranger, johansen } from '../../src/alpha/cointegration'
import { adfTest } from '../../src/alpha/stationarity'
import type { Matrix } from '../../src/alpha/types'

const T = 500

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

const driver = randomWalk(41)
const stationaryNoise = standardNormals(T, 43)
const cointegrated = driver.map((x, i) => 1 + 2 * x + 0.5 * stationaryNoise[i])
const independent = randomWalk(47)

describe('engle-granger', () => {
  it('detects the cointegrated pair and recovers the hedge ratio', () => {
    const result = engleGranger(cointegrated, driver.map((x) => [x]))
    expect(result.cointegrated).toBe(true)
    expect(result.hedgeRatio[1]).toBeCloseTo(2, 1)
    expect(adfTest(result.spread, 0, 'none').stationary).toBe(true)
  })

  it('does not flag independent random walks', () => {
    const result = engleGranger(independent, driver.map((x) => [x]))
    expect(result.cointegrated).toBe(false)
  })
})

describe('johansen', () => {
  it('finds rank one for a cointegrated pair and a stationary combination', () => {
    const levels: Matrix = driver.map((x, i) => [x, cointegrated[i]])
    const result = johansen(levels, 1)
    expect(result.rank).toBe(1)
    expect(result.traceStatistics[0]).toBeGreaterThan(result.traceStatistics[1])
    const vector = result.vectors[0]
    const combination = levels.map((row) => vector[0] * row[0] + vector[1] * row[1])
    expect(adfTest(combination).stationary).toBe(true)
  })

  it('finds rank zero for independent random walks', () => {
    const levels: Matrix = driver.map((x, i) => [x, independent[i], randomWalk(53)[i]])
    expect(johansen(levels, 1).rank).toBe(0)
  })

  it('eigenvalues are sorted and inside the unit interval', () => {
    const levels: Matrix = driver.map((x, i) => [x, cointegrated[i]])
    const { eigenvalues } = johansen(levels, 1)
    expect(eigenvalues[0]).toBeGreaterThanOrEqual(eigenvalues[1])
    for (const value of eigenvalues) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
