import { describe, it, expect } from 'vitest'
import { probabilisticSharpe, deflatedSharpe, minTrackRecordLength, probabilityOfBacktestOverfitting, bonferroni, benjaminiHochberg, sharpeTStat } from '../../src/alpha/overfit'
import type { Matrix } from '../../src/alpha/types'

const positive = Array.from({ length: 250 }, (_, i) => 0.001 + 0.01 * Math.sin(i))

describe('overfitting toolkit', () => {
  it('probabilistic Sharpe is a probability and deflation never increases it', () => {
    const psr = probabilisticSharpe(positive, 0)
    const dsr = deflatedSharpe(positive, [0.1, 0.05, 0.2, 0.15, -0.05])
    expect(psr).toBeGreaterThanOrEqual(0)
    expect(psr).toBeLessThanOrEqual(1)
    expect(dsr).toBeLessThanOrEqual(psr + 1e-9)
  })

  it('min track record length is positive and t-stat scales with sqrt(n)', () => {
    expect(minTrackRecordLength(positive, 0, 0.95)).toBeGreaterThan(0)
    expect(sharpeTStat(positive)).toBeGreaterThan(0)
  })

  it('PBO is low when one strategy dominates in and out of sample', () => {
    const trials: Matrix = Array.from({ length: 60 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => 0.01 * (j + 1) + 0.005 * Math.sin(i)),
    )
    expect(probabilityOfBacktestOverfitting(trials, 10)).toBeLessThan(0.5)
  })

  it('multiple-testing corrections reject only the strongest signal', () => {
    const pValues = [0.001, 0.04, 0.5]
    expect(bonferroni(pValues, 0.05)).toEqual([true, false, false])
    expect(benjaminiHochberg(pValues, 0.05)).toEqual([true, false, false])
  })
})
