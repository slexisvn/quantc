import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { tickBars, volumeBars, dollarBars, type Tick } from '../../src/alpha/bars'
import { tickRule, rollSpread, amihudIlliquidity, kyleLambda, vpin } from '../../src/alpha/microstructure'

describe('bar sampling', () => {
  const ticks: Tick[] = Array.from({ length: 10 }, (_, i) => ({ price: i + 1, volume: 2 }))

  it('tick bars aggregate ohlcv correctly and drop the incomplete tail', () => {
    const bars = tickBars(ticks, 3)
    expect(bars.length).toBe(3)
    expect(bars[0]).toEqual({ open: 1, high: 3, low: 1, close: 3, volume: 6, dollarVolume: 1 * 2 + 2 * 2 + 3 * 2, ticks: 3 })
    expect(bars[2].close).toBe(9)
  })

  it('volume and dollar bars close when their measure crosses the threshold', () => {
    const byVolume = volumeBars(ticks, 4)
    expect(byVolume.length).toBe(5)
    byVolume.forEach((bar) => expect(bar.volume).toBe(4))
    const byDollar = dollarBars(ticks, 10)
    let consumed = 0
    for (const bar of byDollar) {
      expect(bar.dollarVolume).toBeGreaterThanOrEqual(10)
      consumed += bar.ticks
    }
    expect(consumed).toBeLessThanOrEqual(ticks.length)
  })
})

describe('microstructure estimators', () => {
  it('tick rule classifies and carries forward on unchanged prices', () => {
    expect(tickRule([1, 2, 2, 1, 3])).toEqual([0, 1, 1, -1, 1])
  })

  it('roll spread recovers the effective spread of a bid-ask bounce', () => {
    const rng = new MersenneTwister(97)
    const spread = 0.1
    const prices = Array.from({ length: 5000 }, () => 100 + (spread / 2) * (rng.nextDouble() < 0.5 ? -1 : 1))
    expect(rollSpread(prices)).toBeCloseTo(spread, 1)
    const monotone = Array.from({ length: 100 }, (_, i) => 100 + i)
    expect(rollSpread(monotone)).toBe(0)
  })

  it('amihud matches a hand-computed value', () => {
    expect(amihudIlliquidity([0.01, -0.02], [1e6, 2e6])).toBeCloseTo(1e-8, 15)
  })

  it('kyle lambda recovers the injected impact coefficient', () => {
    const rng = new MersenneTwister(101)
    const lambda = 1e-6
    const prices = [100]
    for (let i = 1; i < 2000; i += 1) {
      const volume = 1000 + Math.floor(rng.nextDouble() * 9000)
      const side = rng.nextDouble() < 0.5 ? -1 : 1
      prices.push(prices[i - 1] + lambda * side * volume)
    }
    const volumes = prices.map((_, i) => (i === 0 ? 0 : Math.abs(prices[i] - prices[i - 1]) / lambda))
    expect(kyleLambda(prices, volumes)).toBeCloseTo(lambda, 9)
  })

  it('vpin is higher for one-sided flow than for balanced flow', () => {
    const rng = new MersenneTwister(103)
    const trending: Tick[] = []
    const balanced: Tick[] = []
    let up = 100
    let flat = 100
    for (let i = 0; i < 4000; i += 1) {
      up += 0.01 + rng.nextDouble() * 0.02
      flat += (i % 2 === 0 ? 1 : -1) * (0.01 + rng.nextDouble() * 0.02)
      trending.push({ price: up, volume: 10 })
      balanced.push({ price: flat, volume: 10 })
    }
    const trendingVpin = vpin(trending, 200, 10)
    const balancedVpin = vpin(balanced, 200, 10)
    expect(trendingVpin.length).toBeGreaterThan(0)
    expect(trendingVpin[trendingVpin.length - 1]).toBeGreaterThan(balancedVpin[balancedVpin.length - 1])
  })
})
