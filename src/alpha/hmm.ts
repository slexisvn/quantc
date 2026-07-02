import type { Matrix } from './types'
import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { percentile } from './stats'
import { rows, cols, meanStd, zeros } from './util'

export interface GaussianHmm {
  readonly transition: Matrix
  readonly means: Matrix
  readonly variances: Matrix
  readonly initial: number[]
}

function logDensities(model: GaussianHmm, observations: Matrix): Matrix {
  const states = model.initial.length
  return observations.map((observation) =>
    Array.from({ length: states }, (_, k) => {
      let value = 0
      for (let d = 0; d < observation.length; d += 1) {
        const variance = model.variances[k][d]
        const diff = observation[d] - model.means[k][d]
        value += -0.5 * (Math.log(2 * Math.PI * variance) + (diff * diff) / variance)
      }
      return value
    }),
  )
}

interface ForwardPass {
  readonly filtered: Matrix
  readonly emissions: Matrix
  readonly scales: number[]
  readonly logLikelihood: number
}

function forwardPass(model: GaussianHmm, observations: Matrix): ForwardPass {
  const t = rows(observations)
  const states = model.initial.length
  const logs = logDensities(model, observations)
  const emissions = zeros(t, states)
  const filtered = zeros(t, states)
  const scales = new Array<number>(t).fill(0)
  let logLikelihood = 0
  for (let i = 0; i < t; i += 1) {
    let shift = -Infinity
    for (let k = 0; k < states; k += 1) shift = Math.max(shift, logs[i][k])
    for (let k = 0; k < states; k += 1) emissions[i][k] = Math.exp(logs[i][k] - shift)
    let scale = 0
    for (let k = 0; k < states; k += 1) {
      let prior = 0
      if (i === 0) prior = model.initial[k]
      else for (let j = 0; j < states; j += 1) prior += filtered[i - 1][j] * model.transition[j][k]
      filtered[i][k] = emissions[i][k] * prior
      scale += filtered[i][k]
    }
    const safeScale = Math.max(scale, 1e-300)
    for (let k = 0; k < states; k += 1) filtered[i][k] /= safeScale
    scales[i] = safeScale
    logLikelihood += Math.log(safeScale) + shift
  }
  return { filtered, emissions, scales, logLikelihood }
}

function backwardPass(model: GaussianHmm, forward: ForwardPass): Matrix {
  const t = forward.filtered.length
  const states = model.initial.length
  const beta = zeros(t, states)
  for (let k = 0; k < states; k += 1) beta[t - 1][k] = 1
  for (let i = t - 2; i >= 0; i -= 1) {
    for (let k = 0; k < states; k += 1) {
      let value = 0
      for (let j = 0; j < states; j += 1) value += model.transition[k][j] * forward.emissions[i + 1][j] * beta[i + 1][j]
      beta[i][k] = value / forward.scales[i + 1]
    }
  }
  return beta
}

export interface HmmFitOptions {
  readonly maxIterations: number
  readonly tolerance: number
  readonly seed: number
  readonly varianceFloor: number
  readonly jitter: number
  readonly initialSelfWeight: number
}

export interface HmmFit {
  readonly model: GaussianHmm
  readonly logLikelihood: number
  readonly iterations: number
}

function initialModel(observations: Matrix, states: number, seed: number, jitter: number, varianceFloor: number, initialSelfWeight: number): GaussianHmm {
  const dims = cols(observations)
  const rng = new MersenneTwister(seed)
  const columnStats = Array.from({ length: dims }, (_, d) => meanStd(observations.map((row) => row[d])))
  const means = Array.from({ length: states }, (_, k) =>
    Array.from({ length: dims }, (_, d) => {
      const quantile = percentile(observations.map((row) => row[d]), (k + 1) / (states + 1))
      return quantile + (rng.nextDouble() - 0.5) * jitter * columnStats[d].std
    }),
  )
  const variances = Array.from({ length: states }, () => Array.from({ length: dims }, (_, d) => Math.max(columnStats[d].std ** 2, varianceFloor)))
  const offWeight = states > 1 ? (1 - initialSelfWeight) / (states - 1) : 0
  const transition = Array.from({ length: states }, (_, j) => Array.from({ length: states }, (_, k) => (j === k ? (states > 1 ? initialSelfWeight : 1) : offWeight)))
  const initial = new Array<number>(states).fill(1 / states)
  return { transition, means, variances, initial }
}

export function fitGaussianHmm(observations: Matrix, states: number, options: Partial<HmmFitOptions> = {}): HmmFit {
  const { maxIterations = 200, tolerance = 1e-6, seed = 1, varianceFloor = 1e-10, jitter = 0.01, initialSelfWeight = 0.9 } = options
  const t = rows(observations)
  const dims = cols(observations)
  let model = initialModel(observations, states, seed, jitter, varianceFloor, initialSelfWeight)
  let previous = -Infinity
  let logLikelihood = -Infinity
  let iterations = 0
  for (let iter = 0; iter < maxIterations; iter += 1) {
    iterations = iter + 1
    const forward = forwardPass(model, observations)
    logLikelihood = forward.logLikelihood
    const beta = backwardPass(model, forward)
    const gamma = zeros(t, states)
    for (let i = 0; i < t; i += 1) {
      let total = 0
      for (let k = 0; k < states; k += 1) {
        gamma[i][k] = forward.filtered[i][k] * beta[i][k]
        total += gamma[i][k]
      }
      const safeTotal = Math.max(total, 1e-300)
      for (let k = 0; k < states; k += 1) gamma[i][k] /= safeTotal
    }
    const transitionCounts = zeros(states, states)
    for (let i = 0; i < t - 1; i += 1) {
      for (let j = 0; j < states; j += 1) {
        for (let k = 0; k < states; k += 1) {
          transitionCounts[j][k] += (forward.filtered[i][j] * model.transition[j][k] * forward.emissions[i + 1][k] * beta[i + 1][k]) / forward.scales[i + 1]
        }
      }
    }
    const transition = transitionCounts.map((row) => {
      const total = row.reduce((s, x) => s + x, 0)
      return total < 1e-300 ? row.map(() => 1 / states) : row.map((x) => x / total)
    })
    const means = zeros(states, dims)
    const variances = zeros(states, dims)
    const occupancy = new Array<number>(states).fill(0)
    for (let i = 0; i < t; i += 1) for (let k = 0; k < states; k += 1) occupancy[k] += gamma[i][k]
    for (let k = 0; k < states; k += 1) {
      const weight = Math.max(occupancy[k], 1e-300)
      for (let i = 0; i < t; i += 1) {
        for (let d = 0; d < dims; d += 1) means[k][d] += (gamma[i][k] * observations[i][d]) / weight
      }
      for (let i = 0; i < t; i += 1) {
        for (let d = 0; d < dims; d += 1) {
          const diff = observations[i][d] - means[k][d]
          variances[k][d] += (gamma[i][k] * diff * diff) / weight
        }
      }
      for (let d = 0; d < dims; d += 1) variances[k][d] = Math.max(variances[k][d], varianceFloor)
    }
    model = { transition, means, variances, initial: gamma[0].slice() }
    if (Math.abs(logLikelihood - previous) < tolerance * (1 + Math.abs(previous))) break
    previous = logLikelihood
  }
  return { model, logLikelihood, iterations }
}

export function forwardFilter(model: GaussianHmm, observations: Matrix): Matrix {
  return forwardPass(model, observations).filtered
}

export function viterbi(model: GaussianHmm, observations: Matrix): number[] {
  const t = rows(observations)
  const states = model.initial.length
  if (t === 0) return []
  const logs = logDensities(model, observations)
  const logTransition = model.transition.map((row) => row.map((p) => Math.log(Math.max(p, 1e-300))))
  const score = zeros(t, states)
  const from = Array.from({ length: t }, () => new Array<number>(states).fill(0))
  for (let k = 0; k < states; k += 1) score[0][k] = Math.log(Math.max(model.initial[k], 1e-300)) + logs[0][k]
  for (let i = 1; i < t; i += 1) {
    for (let k = 0; k < states; k += 1) {
      let best = -Infinity
      let bestFrom = 0
      for (let j = 0; j < states; j += 1) {
        const value = score[i - 1][j] + logTransition[j][k]
        if (value > best) {
          best = value
          bestFrom = j
        }
      }
      score[i][k] = best + logs[i][k]
      from[i][k] = bestFrom
    }
  }
  const path = new Array<number>(t).fill(0)
  let best = -Infinity
  for (let k = 0; k < states; k += 1) {
    if (score[t - 1][k] > best) {
      best = score[t - 1][k]
      path[t - 1] = k
    }
  }
  for (let i = t - 1; i > 0; i -= 1) path[i - 1] = from[i][path[i]]
  return path
}
