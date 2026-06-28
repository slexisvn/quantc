import type { Matrix } from './types'
import { ols, withIntercept } from './regression'
import { jacobiEigen } from '../risk/pca'
import { sampleCovariance } from './covariance'
import { rows, cols } from './util'

export interface FactorFit {
  readonly alpha: number
  readonly betas: number[]
  readonly residualVol: number
  readonly rSquared: number
  readonly alphaTStat: number
  readonly betaTStats: number[]
}

export function factorRegression(assetReturns: number[], factorReturns: Matrix): FactorFit {
  const design = withIntercept(factorReturns)
  const fit = ols(design, assetReturns)
  const dof = Math.max(1, fit.residuals.length - design[0].length)
  let sse = 0
  for (const e of fit.residuals) sse += e * e
  return {
    alpha: fit.coefficients[0],
    betas: fit.coefficients.slice(1),
    residualVol: Math.sqrt(sse / dof),
    rSquared: fit.rSquared,
    alphaTStat: fit.tStats[0],
    betaTStats: fit.tStats.slice(1),
  }
}

export interface RiskAttribution {
  readonly factor: number
  readonly specific: number
  readonly total: number
}

export function factorRiskAttribution(betas: number[], factorCovariance: Matrix, specificVariance: number): RiskAttribution {
  let factorVariance = 0
  for (let i = 0; i < betas.length; i += 1) {
    for (let j = 0; j < betas.length; j += 1) factorVariance += betas[i] * factorCovariance[i][j] * betas[j]
  }
  return {
    factor: Math.sqrt(Math.max(factorVariance, 0)),
    specific: Math.sqrt(Math.max(specificVariance, 0)),
    total: Math.sqrt(Math.max(factorVariance + specificVariance, 0)),
  }
}

export interface StatisticalFactors {
  readonly factors: Matrix
  readonly loadings: Matrix
  readonly explained: number[]
}

export function pcaFactors(returns: Matrix, count: number): StatisticalFactors {
  const covariance = sampleCovariance(returns)
  const eigen = jacobiEigen(covariance)
  const n = covariance.length
  const top = Math.min(count, n)
  const totalVariance = eigen.values.reduce((sum, v) => sum + Math.max(v, 0), 0) || 1
  const loadings = Array.from({ length: n }, () => new Array<number>(top).fill(0))
  for (let f = 0; f < top; f += 1) for (let i = 0; i < n; i += 1) loadings[i][f] = eigen.vectors[f][i]
  const t = rows(returns)
  const assets = cols(returns)
  const factors = Array.from({ length: t }, () => new Array<number>(top).fill(0))
  for (let s = 0; s < t; s += 1) {
    for (let f = 0; f < top; f += 1) {
      let value = 0
      for (let i = 0; i < assets; i += 1) value += loadings[i][f] * returns[s][i]
      factors[s][f] = value
    }
  }
  const explained = eigen.values.slice(0, top).map((v) => Math.max(v, 0) / totalVariance)
  return { factors, loadings, explained }
}
