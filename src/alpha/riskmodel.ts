import type { Matrix } from './types'
import { ols, withIntercept, type Regression } from './regression'
import { sampleCovariance } from './covariance'
import { rows, cols, meanStd, standardize } from './util'

export function standardizeExposures(exposures: Matrix): Matrix {
  const n = rows(exposures)
  const k = cols(exposures)
  const out = Array.from({ length: n }, () => new Array<number>(k).fill(0))
  for (let f = 0; f < k; f += 1) {
    const { mean, std } = meanStd(exposures.map((row) => row[f]))
    for (let i = 0; i < n; i += 1) out[i][f] = standardize(exposures[i][f], mean, std)
  }
  return out
}

export interface CharacteristicModelOptions {
  readonly standardize: boolean
  readonly intercept: boolean
}

function periodFit(target: readonly number[], exposures: Matrix, standardize: boolean, intercept: boolean): Regression {
  const design = standardize ? standardizeExposures(exposures) : exposures
  return ols(intercept ? withIntercept(design) : design, [...target])
}

export interface CharacteristicModel {
  readonly factorReturns: Matrix
  readonly factorCovariance: Matrix
  readonly specificVariances: number[]
  readonly rSquared: number[]
}

export function crossSectionalFactorModel(returns: Matrix, characteristics: readonly Matrix[], options: Partial<CharacteristicModelOptions> = {}): CharacteristicModel {
  const { standardize = true, intercept = true } = options
  const periods = Math.min(characteristics.length, rows(returns) - 1)
  const factorReturns: Matrix = []
  const residuals: Matrix = []
  const rSquared: number[] = []
  for (let p = 0; p < periods; p += 1) {
    const fit = periodFit(returns[p + 1], characteristics[p], standardize, intercept)
    factorReturns.push(fit.coefficients)
    residuals.push(fit.residuals)
    rSquared.push(fit.rSquared)
  }
  const assets = cols(returns)
  const specificVariances = Array.from({ length: assets }, (_, j) => {
    const { std } = meanStd(residuals.map((row) => row[j]))
    return std * std
  })
  return { factorReturns, factorCovariance: sampleCovariance(factorReturns), specificVariances, rSquared }
}

export function neutralizeScores(scores: Matrix, characteristics: readonly Matrix[], options: Partial<CharacteristicModelOptions> = {}): Matrix {
  const { standardize = true, intercept = true } = options
  return scores.map((row, p) => (p < characteristics.length ? periodFit(row, characteristics[p], standardize, intercept).residuals : row.slice()))
}
