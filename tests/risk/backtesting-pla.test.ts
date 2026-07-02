import { describe, it, expect } from 'vitest'
import { chiSquareCdf } from '../../src/numerics/stats/gamma'
import { kupiecPof, christoffersenIndependence, christoffersenConditionalCoverage, baselTrafficLight } from '../../src/risk/backtesting'
import { plaTest } from '../../src/risk/pla'
import { FRTB_PARAMETERS_STANDARD } from '../../src/risk/frtb-parameters'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../src/numerics/rng/inverse-normal-cdf'

const params = FRTB_PARAMETERS_STANDARD

describe('chi-square CDF', () => {
  it('reproduces the standard critical values', () => {
    expect(chiSquareCdf(3.841, 1)).toBeCloseTo(0.95, 3)
    expect(chiSquareCdf(5.991, 2)).toBeCloseTo(0.95, 3)
  })
})

describe('VaR backtesting', () => {
  it('Kupiec LR is zero when the observed rate equals the expected rate', () => {
    expect(kupiecPof(5, 100, 0.95).statistic).toBeCloseTo(0, 10)
  })

  it('Kupiec LR matches the hand computation for 10/250 at 99%', () => {
    const expected = -2 * (240 * Math.log(0.99) + 10 * Math.log(0.01) - (240 * Math.log(0.96) + 10 * Math.log(0.04)))
    expect(kupiecPof(10, 250, 0.99).statistic).toBeCloseTo(expected, 8)
  })

  it('Christoffersen independence detects clustering of exceptions', () => {
    const clustered = new Array(250).fill(0)
    for (let i = 20; i < 30; i += 1) clustered[i] = 1
    const spread = new Array(250).fill(0)
    for (let i = 0; i < 10; i += 1) spread[i * 25] = 1
    expect(christoffersenIndependence(clustered).statistic).toBeGreaterThan(christoffersenIndependence(spread).statistic)
    expect(christoffersenIndependence(clustered).statistic).toBeGreaterThan(3.841)
  })

  it('conditional coverage combines the two likelihood ratios and traffic-lights exceptions', () => {
    const clustered = new Array(250).fill(0)
    for (let i = 20; i < 35; i += 1) clustered[i] = 1
    const cc = christoffersenConditionalCoverage(clustered, 0.99)
    expect(cc.statistic).toBeGreaterThan(0)
    expect(baselTrafficLight(3, params)).toBe('green')
    expect(baselTrafficLight(6, params)).toBe('amber')
    expect(baselTrafficLight(11, params)).toBe('red')
  })
})

function normalSeries(seed: number, count: number, scale: number): number[] {
  const generator = new MersenneTwister(seed)
  const out = new Array<number>(count)
  for (let i = 0; i < count; i += 1) out[i] = scale * inverseNormalCdf(generator.nextDouble())
  return out
}

describe('P&L attribution test', () => {
  const hpl = normalSeries(2024, 250, 1)

  it('identical series land in the green zone', () => {
    const result = plaTest(hpl, hpl, params)
    expect(result.spearman).toBeCloseTo(1, 10)
    expect(result.ks).toBeCloseTo(0, 10)
    expect(result.zone).toBe('green')
  })

  it('uncorrelated noise lands in the red zone', () => {
    const noise = normalSeries(999, 250, 1)
    expect(plaTest(hpl, noise, params).zone).toBe('red')
  })

  it('a rank-preserving rescale is decided by the KS statistic', () => {
    const scaled = hpl.map((x) => 2 * x)
    const result = plaTest(hpl, scaled, params)
    expect(result.spearman).toBeCloseTo(1, 10)
    expect(result.ks).toBeGreaterThan(params.plaThresholds.ksRed)
    expect(result.zone).toBe('red')
  })
})
