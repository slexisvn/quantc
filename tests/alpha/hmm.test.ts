import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { standardNormals } from '../../src/numerics/sampling'
import { fitGaussianHmm, viterbi, forwardFilter } from '../../src/alpha/hmm'
import type { Matrix } from '../../src/alpha/types'

const T = 1500
const trueMeans = [0.002, -0.003]
const trueStds = [0.005, 0.02]
const stay = 0.97

function simulate(seed: number): { observations: Matrix; states: number[] } {
  const rng = new MersenneTwister(seed)
  const normals = standardNormals(T, seed + 1)
  const states: number[] = [0]
  for (let i = 1; i < T; i += 1) states.push(rng.nextDouble() < stay ? states[i - 1] : 1 - states[i - 1])
  const observations = states.map((s, i) => [trueMeans[s] + trueStds[s] * normals[i]])
  return { observations, states }
}

const { observations, states } = simulate(3)
const fit = fitGaussianHmm(observations, 2, { seed: 5 })
const lowVolState = fit.model.variances[0][0] < fit.model.variances[1][0] ? 0 : 1

describe('gaussian hmm', () => {
  it('recovers the state means and volatilities', () => {
    expect(Math.sqrt(fit.model.variances[lowVolState][0])).toBeCloseTo(trueStds[0], 2)
    expect(Math.sqrt(fit.model.variances[1 - lowVolState][0])).toBeCloseTo(trueStds[1], 2)
    expect(fit.model.means[lowVolState][0]).toBeCloseTo(trueMeans[0], 2)
    expect(fit.model.means[1 - lowVolState][0]).toBeCloseTo(trueMeans[1], 2)
  })

  it('recovers persistent transition dynamics', () => {
    expect(fit.model.transition[0][0]).toBeGreaterThan(0.9)
    expect(fit.model.transition[1][1]).toBeGreaterThan(0.9)
  })

  it('viterbi decodes most states correctly', () => {
    const decoded = viterbi(fit.model, observations)
    let correct = 0
    for (let i = 0; i < T; i += 1) {
      const mapped = decoded[i] === lowVolState ? 0 : 1
      if (mapped === states[i]) correct += 1
    }
    expect(correct / T).toBeGreaterThan(0.9)
  })

  it('log likelihood is non-decreasing across em iterations', () => {
    let previous = -Infinity
    for (let iterations = 1; iterations <= 6; iterations += 1) {
      const partial = fitGaussianHmm(observations, 2, { seed: 5, maxIterations: iterations, tolerance: 0 })
      expect(partial.logLikelihood).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = partial.logLikelihood
    }
  })

  it('forward filter is causal and row stochastic', () => {
    const filtered = forwardFilter(fit.model, observations)
    for (let i = 0; i < 50; i += 1) expect(filtered[i][0] + filtered[i][1]).toBeCloseTo(1, 10)
    const cutoff = 700
    const perturbed = observations.map((row, i) => (i > cutoff ? [row[0] + 1] : row.slice()))
    const shifted = forwardFilter(fit.model, perturbed)
    for (let i = 0; i <= cutoff; i += 1) expect(shifted[i][0]).toBe(filtered[i][0])
  })
})
