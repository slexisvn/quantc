import type { Matrix } from './types'
import { differentialEvolution } from '../numerics/optimization/differential-evolution'
import { meanStd } from './util'
import { portfolioReturns, scaleWeightsToVol } from './sizing'

export interface GarchParams {
  readonly omega: number
  readonly alpha: number
  readonly beta: number
}

function sampleVariance(returns: readonly number[]): number {
  const { std } = meanStd([...returns])
  return std * std
}

export function garchVariances(returns: readonly number[], params: GarchParams, initialVariance?: number): number[] {
  const out = new Array<number>(returns.length).fill(0)
  let variance = initialVariance ?? sampleVariance(returns)
  for (let i = 0; i < returns.length; i += 1) {
    out[i] = variance
    variance = params.omega + params.alpha * returns[i] * returns[i] + params.beta * variance
  }
  return out
}

export function garchVolatility(returns: readonly number[], params: GarchParams, initialVariance?: number): number[] {
  return garchVariances(returns, params, initialVariance).map((v) => Math.sqrt(Math.max(v, 0)))
}

export function garchLogLikelihood(returns: readonly number[], params: GarchParams, initialVariance?: number): number {
  const variances = garchVariances(returns, params, initialVariance)
  let logLikelihood = 0
  for (let i = 0; i < returns.length; i += 1) {
    const variance = Math.max(variances[i], 1e-18)
    logLikelihood += -0.5 * (Math.log(2 * Math.PI) + Math.log(variance) + (returns[i] * returns[i]) / variance)
  }
  return logLikelihood
}

export interface GarchFitOptions {
  readonly varianceTargeting: boolean
  readonly seed: number
  readonly alphaRange: readonly [number, number]
  readonly betaRange: readonly [number, number]
  readonly omegaScaleRange: readonly [number, number]
  readonly stationarityMargin: number
}

export interface GarchFit {
  readonly params: GarchParams
  readonly logLikelihood: number
  readonly persistence: number
  readonly unconditionalVariance: number
  readonly variances: number[]
}

export function fitGarch(returns: readonly number[], options: Partial<GarchFitOptions> = {}): GarchFit {
  const { varianceTargeting = true, seed = 1, alphaRange = [1e-4, 0.4], betaRange = [0.3, 0.999], omegaScaleRange = [1e-3, 2], stationarityMargin = 1e-4 } = options
  const targetVariance = sampleVariance(returns)
  const toParams = (x: number[]): GarchParams => {
    const alpha = x[0]
    const beta = x[1]
    const omega = varianceTargeting ? targetVariance * (1 - alpha - beta) : x[2] * targetVariance
    return { omega, alpha, beta }
  }
  const objective = (x: number[]): number => {
    const params = toParams(x)
    if (params.alpha + params.beta >= 1 - stationarityMargin || params.omega <= 0) return 1e12 + params.alpha + params.beta
    return -garchLogLikelihood(returns, params)
  }
  const lower = varianceTargeting ? [alphaRange[0], betaRange[0]] : [alphaRange[0], betaRange[0], omegaScaleRange[0]]
  const upper = varianceTargeting ? [alphaRange[1], betaRange[1]] : [alphaRange[1], betaRange[1], omegaScaleRange[1]]
  const solution = differentialEvolution(objective, lower, upper, { seed })
  const params = toParams(solution.point)
  const persistence = params.alpha + params.beta
  return {
    params,
    logLikelihood: garchLogLikelihood(returns, params),
    persistence,
    unconditionalVariance: persistence < 1 ? params.omega / (1 - persistence) : Infinity,
    variances: garchVariances(returns, params),
  }
}

export function garchForecast(returns: readonly number[], params: GarchParams, horizon: number, initialVariance?: number): number[] {
  const variances = garchVariances(returns, params, initialVariance)
  const lastReturn = returns.length === 0 ? 0 : returns[returns.length - 1]
  const lastVariance = variances.length === 0 ? params.omega : variances[variances.length - 1]
  const persistence = params.alpha + params.beta
  const unconditional = persistence < 1 ? params.omega / (1 - persistence) : lastVariance
  const out = new Array<number>(horizon).fill(0)
  let next = params.omega + params.alpha * lastReturn * lastReturn + params.beta * lastVariance
  for (let h = 0; h < horizon; h += 1) {
    out[h] = next
    next = unconditional + persistence * (next - unconditional)
  }
  return out
}

export function garchVolTarget(weights: Matrix, returns: Matrix, target: number, params: GarchParams, periodsPerYear = 252, maxScale = 3): Matrix {
  const persistence = params.alpha + params.beta
  const initialVariance = persistence < 1 ? params.omega / (1 - persistence) : params.omega
  const vol = garchVolatility(portfolioReturns(weights, returns), params, initialVariance)
  return scaleWeightsToVol(weights, vol, target, periodsPerYear, maxScale)
}
