import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { cusumEvents, sadfStatistic, bsadfSeries } from '../../src/alpha/structural'
import { tripleBarrier } from '../../src/alpha/labeling'

describe('cusum event filter', () => {
  it('fires exactly once at a single jump', () => {
    const series = Array.from({ length: 100 }, (_, i) => (i < 50 ? 10 : 20))
    expect(cusumEvents(series, 5)).toEqual([50])
    expect(cusumEvents(series, 100)).toEqual([])
  })

  it('drift compensation silences a steady trend', () => {
    const slope = 0.1
    const trending = Array.from({ length: 200 }, (_, i) => i * slope)
    expect(cusumEvents(trending, 1, slope).length).toBe(0)
    expect(cusumEvents(trending, 1).length).toBeGreaterThan(10)
  })

  it('fires on both up and down moves', () => {
    const series = Array.from({ length: 100 }, (_, i) => (i < 30 ? 0 : i < 60 ? 15 : -5))
    const events = cusumEvents(series, 5)
    expect(events).toContain(30)
    expect(events).toContain(60)
  })

  it('events feed triple-barrier labeling directly', () => {
    const prices = Array.from({ length: 120 }, (_, i) => 100 * 1.01 ** i)
    const events = cusumEvents(prices, 20)
    const labels = tripleBarrier(prices, events, { profitTake: 0.05, stopLoss: 0.05, maxHolding: 30 })
    expect(labels.length).toBe(events.length)
    labels.forEach((label) => expect(label.label).toBe(1))
  })
})

describe('sadf explosiveness', () => {
  const T = 150

  function randomWalk(seed: number): number[] {
    const steps = standardNormals(T, seed)
    const out: number[] = []
    let level = 100
    for (const z of steps) {
      level += z
      out.push(level)
    }
    return out
  }

  function explosive(seed: number): number[] {
    const steps = standardNormals(T, seed)
    const out: number[] = []
    let level = 100
    for (const z of steps) {
      level = level * 1.03 + z
      out.push(level)
    }
    return out
  }

  it('ranks an explosive series above a random walk', () => {
    const bubble = sadfStatistic(explosive(83), 30)
    const walk = sadfStatistic(randomWalk(89), 30)
    expect(bubble).toBeGreaterThan(walk)
    expect(bubble).toBeGreaterThan(0)
  })

  it('bsadf is per-period, warms up with zeros, and dominates the anchored statistic at the end', () => {
    const series = explosive(83)
    const backward = bsadfSeries(series, 30)
    expect(backward.length).toBe(T)
    expect(backward[10]).toBe(0)
    expect(backward[T - 1]).toBeGreaterThanOrEqual(sadfStatistic(series, 30) - 1e-12)
  })
})
