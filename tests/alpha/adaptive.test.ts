import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { rollingIcWeights, ewmaIcWeights, adaptiveCombine, stackSignals } from '../../src/alpha/adaptive'
import { combineSignals, blendZscored, icSeries } from '../../src/alpha/ic'
import { pearson } from '../../src/alpha/stats'
import type { Matrix } from '../../src/alpha/types'

const T = 200
const N = 10
const rng = new MersenneTwister(53)
const returns: Matrix = Array.from({ length: T }, () => Array.from({ length: N }, () => (rng.nextDouble() - 0.5) * 0.02))
const predictive: Matrix = Array.from({ length: T }, (_, i) => Array.from({ length: N }, (_, j) => (i + 1 < T ? returns[i + 1][j] : 0) + (rng.nextDouble() - 0.5) * 0.002))
const noise: Matrix = Array.from({ length: T }, () => Array.from({ length: N }, () => (rng.nextDouble() - 0.5) * 0.02))

describe('combine signals pin', () => {
  it('matches the hand-computed z-score blend after the refactor', () => {
    const a: Matrix = [
      [1, 2, 3],
      [3, 1, 2],
    ]
    const b: Matrix = [
      [2, 2, 2],
      [1, 2, 3],
    ]
    const combined = combineSignals([a, b], [0.5, 0.5])
    expect(combined[0][0]).toBeCloseTo(-0.5, 12)
    expect(combined[0][1]).toBeCloseTo(0, 12)
    expect(combined[0][2]).toBeCloseTo(0.5, 12)
    expect(combined[1][0]).toBeCloseTo(0.5 * 1 + 0.5 * -1, 12)
    const viaBlend = blendZscored([a, b], () => 0.5)
    combined.forEach((row, i) => row.forEach((x, j) => expect(x).toBe(viaBlend[i][j])))
  })
})

describe('adaptive ic weighting', () => {
  it('puts dominant weight on the predictive signal', () => {
    const weights = rollingIcWeights([predictive, noise], returns, 60)
    expect(weights[T - 1][0]).toBeGreaterThan(0.9)
    const smooth = ewmaIcWeights([predictive, noise], returns, 0.9)
    expect(smooth[T - 1][0]).toBeGreaterThan(0.9)
  })

  it('weights are causal in the realized returns', () => {
    const cutoff = 150
    const perturbed = returns.map((row, i) => (i > cutoff ? row.map((x) => x + 1) : row.slice()))
    const base = rollingIcWeights([predictive, noise], returns, 60)
    const shifted = rollingIcWeights([predictive, noise], perturbed, 60)
    for (let i = 0; i <= cutoff; i += 1) {
      expect(shifted[i][0]).toBe(base[i][0])
      expect(shifted[i][1]).toBe(base[i][1])
    }
  })

  it('adaptive combination beats the noise signal in forward ic', () => {
    const weights = rollingIcWeights([predictive, noise], returns, 60)
    const combined = adaptiveCombine([predictive, noise], weights)
    const combinedIc = icSeries(combined, returns).slice(80)
    const noiseIc = icSeries(noise, returns).slice(80)
    const average = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length
    expect(average(combinedIc)).toBeGreaterThan(average(noiseIc) + 0.3)
  })
})

describe('signal stacking', () => {
  it('the stacked signal correlates with forward returns', () => {
    const stacked = stackSignals([predictive, noise], returns, 60, 1e-4)
    const flatSignal: number[] = []
    const flatForward: number[] = []
    for (let i = 80; i < T - 1; i += 1) {
      for (let j = 0; j < N; j += 1) {
        flatSignal.push(stacked[i][j])
        flatForward.push(returns[i + 1][j])
      }
    }
    expect(pearson(flatSignal, flatForward)).toBeGreaterThan(0.5)
  })
})
