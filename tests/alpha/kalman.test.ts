import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { standardNormals } from '../../src/numerics/sampling'
import { dynamicBeta, kalmanSmoother, kalmanFilter, type KalmanSpec } from '../../src/alpha/kalman'
import { identity, scaleMatrix } from '../../src/alpha/linalg'

const T = 600
const rng = new MersenneTwister(61)
const x = Array.from({ length: T }, () => rng.nextDouble() * 2 - 1)
const noise = standardNormals(T, 63)

describe('dynamic beta', () => {
  it('converges to the static regression coefficients', () => {
    const y = x.map((v, i) => 1 + 2 * v + 0.01 * noise[i])
    const result = dynamicBeta(y, x.map((v) => [v]), { processNoise: 1e-6 })
    const last = result.states[T - 1]
    expect(last[0]).toBeCloseTo(1, 1)
    expect(last[1]).toBeCloseTo(2, 1)
    result.innovationVariances.forEach((v) => expect(v).toBeGreaterThan(0))
  })

  it('tracks a time-varying beta', () => {
    const y = x.map((v, i) => (i < 300 ? 1 : 3) * v + 0.02 * noise[i])
    const result = dynamicBeta(y, x.map((v) => [v]), { processNoise: 1e-3, observationNoise: 1e-3 })
    expect(result.states[250][1]).toBeCloseTo(1, 0)
    expect(result.states[T - 1][1]).toBeCloseTo(3, 0)
  })

  it('is causal in the observations', () => {
    const y = x.map((v, i) => 2 * v + 0.02 * noise[i])
    const cutoff = 400
    const perturbed = y.map((v, i) => (i > cutoff ? v + 100 : v))
    const base = dynamicBeta(y, x.map((v) => [v]))
    const shifted = dynamicBeta(perturbed, x.map((v) => [v]))
    for (let i = 0; i <= cutoff; i += 1) {
      expect(shifted.states[i][0]).toBe(base.states[i][0])
      expect(shifted.states[i][1]).toBe(base.states[i][1])
    }
  })
})

describe('kalman smoother', () => {
  it('reduces average state error relative to the filter on a static model', () => {
    const y = x.map((v, i) => 1 + 2 * v + 0.05 * noise[i])
    const observationVectors = x.map((v) => [1, v])
    const spec: KalmanSpec = {
      transition: identity(2),
      processNoise: scaleMatrix(identity(2), 1e-6),
      observationNoise: 1e-2,
      initialState: [0, 0],
      initialCovariance: identity(2),
    }
    const filtered = kalmanFilter(y, observationVectors, spec)
    const smoothed = kalmanSmoother(y, observationVectors, spec)
    expect(smoothed.length).toBe(T)
    const error = (states: number[][]): number => {
      let total = 0
      for (let i = 50; i < T; i += 1) total += Math.abs(states[i][0] - 1) + Math.abs(states[i][1] - 2)
      return total
    }
    expect(error(smoothed)).toBeLessThanOrEqual(error(filtered.states) * 1.01)
  })
})
