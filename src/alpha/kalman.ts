import type { Matrix } from './types'
import { matVec, matMul, transpose, identity, scaleMatrix, addMatrices, invert, symmetrize } from './linalg'

export interface KalmanSpec {
  readonly transition: Matrix
  readonly processNoise: Matrix
  readonly observationNoise: number
  readonly initialState: readonly number[]
  readonly initialCovariance: Matrix
}

export interface KalmanResult {
  readonly states: Matrix
  readonly covariances: readonly Matrix[]
  readonly innovations: number[]
  readonly innovationVariances: number[]
}

export function kalmanFilter(observations: readonly number[], observationVectors: Matrix, spec: KalmanSpec): KalmanResult {
  const k = spec.initialState.length
  let state = [...spec.initialState]
  let covariance = spec.initialCovariance.map((row) => row.slice())
  const states: Matrix = []
  const covariances: Matrix[] = []
  const innovations: number[] = []
  const innovationVariances: number[] = []
  for (let i = 0; i < observations.length; i += 1) {
    state = matVec(spec.transition, state)
    covariance = addMatrices(matMul(matMul(spec.transition, covariance), transpose(spec.transition)), spec.processNoise)
    const h = observationVectors[i]
    const covarianceH = matVec(covariance, [...h])
    let innovationVariance = spec.observationNoise
    for (let j = 0; j < k; j += 1) innovationVariance += h[j] * covarianceH[j]
    let predicted = 0
    for (let j = 0; j < k; j += 1) predicted += h[j] * state[j]
    const innovation = observations[i] - predicted
    const safeVariance = Math.max(innovationVariance, 1e-24)
    const gain = covarianceH.map((x) => x / safeVariance)
    for (let j = 0; j < k; j += 1) state[j] += gain[j] * innovation
    covariance = symmetrize(covariance.map((row, a) => row.map((x, b) => x - gain[a] * covarianceH[b])))
    states.push(state.slice())
    covariances.push(covariance.map((row) => row.slice()))
    innovations.push(innovation)
    innovationVariances.push(innovationVariance)
  }
  return { states, covariances, innovations, innovationVariances }
}

export function kalmanSmoother(observations: readonly number[], observationVectors: Matrix, spec: KalmanSpec): Matrix {
  const k = spec.initialState.length
  const filtered = kalmanFilter(observations, observationVectors, spec)
  const t = observations.length
  if (t === 0) return []
  const predictedStates: Matrix = []
  const predictedCovariances: Matrix[] = []
  for (let i = 0; i < t; i += 1) {
    const previousState = i === 0 ? [...spec.initialState] : filtered.states[i - 1]
    const previousCovariance = i === 0 ? spec.initialCovariance : filtered.covariances[i - 1]
    predictedStates.push(matVec(spec.transition, previousState))
    predictedCovariances.push(addMatrices(matMul(matMul(spec.transition, previousCovariance), transpose(spec.transition)), spec.processNoise))
  }
  const smoothed = filtered.states.map((row) => row.slice())
  for (let i = t - 2; i >= 0; i -= 1) {
    const smoother = matMul(matMul(filtered.covariances[i], transpose(spec.transition)), invert(predictedCovariances[i + 1]))
    const correction = matVec(smoother, smoothed[i + 1].map((x, j) => x - predictedStates[i + 1][j]))
    for (let j = 0; j < k; j += 1) smoothed[i][j] += correction[j]
  }
  return smoothed
}

export interface DynamicBetaConfig {
  readonly processNoise: number
  readonly observationNoise: number
  readonly initialVariance: number
}

export function dynamicBeta(dependent: readonly number[], regressors: Matrix, config: Partial<DynamicBetaConfig> = {}): KalmanResult {
  const { processNoise = 1e-4, observationNoise = 1e-2, initialVariance = 1 } = config
  const k = (regressors.length === 0 ? 0 : regressors[0].length) + 1
  const spec: KalmanSpec = {
    transition: identity(k),
    processNoise: scaleMatrix(identity(k), processNoise),
    observationNoise,
    initialState: new Array<number>(k).fill(0),
    initialCovariance: scaleMatrix(identity(k), initialVariance),
  }
  return kalmanFilter(dependent, regressors.map((row) => [1, ...row]), spec)
}
