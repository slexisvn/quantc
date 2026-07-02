import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { tripleBarrier, sampleUniqueness, metaLabeling } from '../../src/alpha/labeling'
import { logisticRegression, withIntercept, ols, ridgeRegression } from '../../src/alpha/regression'

function geometricPath(length: number, step: number): number[] {
  return Array.from({ length }, (_, i) => 100 * (1 + step) ** i)
}

describe('triple barrier', () => {
  const config = { profitTake: 0.05, stopLoss: 0.05, maxHolding: 50 }

  it('a rising path hits the profit-take barrier', () => {
    const [label] = tripleBarrier(geometricPath(60, 0.01), [0], config)
    expect(label.label).toBe(1)
    expect(label.end).toBe(5)
    expect(label.ret).toBeGreaterThanOrEqual(0.05)
  })

  it('a falling path hits the stop-loss barrier', () => {
    const [label] = tripleBarrier(geometricPath(60, -0.01), [0], config)
    expect(label.label).toBe(-1)
    expect(label.end).toBe(6)
    expect(label.ret).toBeLessThanOrEqual(-0.05)
  })

  it('a flat path expires at the vertical barrier', () => {
    const flat = Array.from({ length: 60 }, () => 100)
    const [label] = tripleBarrier(flat, [3], config)
    expect(label.label).toBe(0)
    expect(label.end).toBe(3 + config.maxHolding)
    expect(label.ret).toBe(0)
  })

  it('volatility scaling widens the barriers', () => {
    const path = geometricPath(60, 0.01)
    const wide = tripleBarrier(path, [0], config, Array.from({ length: 60 }, () => 2))[0]
    const narrow = tripleBarrier(path, [0], config)[0]
    expect(wide.end).toBeGreaterThan(narrow.end)
  })
})

describe('sample uniqueness', () => {
  it('disjoint labels are fully unique and identical spans split concurrency', () => {
    const disjoint = sampleUniqueness(
      [
        { start: 0, end: 4, label: 1, ret: 0.1 },
        { start: 10, end: 14, label: -1, ret: -0.1 },
      ],
      20,
    )
    expect(disjoint[0]).toBeCloseTo(1, 12)
    expect(disjoint[1]).toBeCloseTo(1, 12)
    const overlapped = sampleUniqueness(
      [
        { start: 0, end: 4, label: 1, ret: 0.1 },
        { start: 0, end: 4, label: 1, ret: 0.1 },
      ],
      20,
    )
    expect(overlapped[0]).toBeCloseTo(0.5, 12)
    expect(overlapped[1]).toBeCloseTo(0.5, 12)
  })
})

describe('logistic regression', () => {
  const rng = new MersenneTwister(21)
  const features = Array.from({ length: 300 }, () => [rng.nextDouble() * 4 - 2])
  const labels = features.map(([x]) => (x + (rng.nextDouble() - 0.5) * 0.2 > 0 ? 1 : 0))

  it('recovers a monotone probability in the separating feature', () => {
    const fit = logisticRegression(withIntercept(features), labels)
    expect(fit.iterations).toBeLessThan(50)
    expect(fit.coefficients[1]).toBeGreaterThan(0)
    const low = fit.probabilities[features.findIndex(([x]) => x < -1.5)]
    const high = fit.probabilities[features.findIndex(([x]) => x > 1.5)]
    expect(low).toBeLessThan(0.1)
    expect(high).toBeGreaterThan(0.9)
  })

  it('meta labeling scores true positives above false positives', () => {
    const events = Array.from({ length: 100 }, (_, i) => i)
    const sides = events.map((_, i) => (i % 2 === 0 ? 1 : -1))
    const barrierLabels = events.map((start, i) => {
      const good = i < 50
      const ret = (good ? 0.02 : -0.02) * sides[i]
      return { start, end: start + 1, label: Math.sign(ret) as -1 | 0 | 1, ret }
    })
    const feature = events.map((_, i) => [i < 50 ? 1 : -1])
    const { probabilities } = metaLabeling(feature, sides, barrierLabels)
    expect(probabilities[0]).toBeGreaterThan(0.9)
    expect(probabilities[99]).toBeLessThan(0.1)
  })
})

describe('ridge regression', () => {
  const rng = new MersenneTwister(31)
  const design = withIntercept(Array.from({ length: 200 }, () => [rng.nextDouble() * 2 - 1, rng.nextDouble() * 2 - 1]))
  const response = design.map((row) => 0.5 + 2 * row[1] - row[2] + (rng.nextDouble() - 0.5) * 0.1)

  it('lambda zero matches ols and the norm shrinks with lambda', () => {
    const olsFit = ols(design, response)
    const zero = ridgeRegression(design, response, 0)
    zero.forEach((c, i) => expect(c).toBeCloseTo(olsFit.coefficients[i], 8))
    const normOf = (xs: number[]): number => Math.sqrt(xs.reduce((a, b) => a + b * b, 0))
    expect(normOf(ridgeRegression(design, response, 10))).toBeLessThan(normOf(zero))
  })
})
