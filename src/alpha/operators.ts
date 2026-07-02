import type { Matrix, Operator, OperatorFactory } from './types'
import { toReturns } from './util'
import { tsMean, tsStd, tsZscore, tsSum, tsProduct, tsMin, tsMax, tsArgmax, tsArgmin, tsRank, tsDelay, tsDelta, decayLinear } from './ts-operators'
import { csRank, csZscore, csDemean, csWinsorize, csTruncate, csScale } from './cs-operators'
import { fracDiff } from './fracdiff'

export function pipe(...operators: Operator[]): Operator {
  return (m) => operators.reduce((current, operator) => operator(current), m)
}

export function elementwise(fn: (a: number, b: number) => number): (x: Matrix, y: Matrix) => Matrix {
  return (x, y) => x.map((row, i) => row.map((a, j) => fn(a, y[i][j])))
}

export function toReturnsOperator(): Operator {
  return (m) => toReturns(m)
}

export const OPERATORS: Record<string, OperatorFactory> = {
  tsMean: (params = {}) => tsMean(params.window),
  tsStd: (params = {}) => tsStd(params.window),
  tsZscore: (params = {}) => tsZscore(params.window),
  tsSum: (params = {}) => tsSum(params.window),
  tsProduct: (params = {}) => tsProduct(params.window),
  tsMin: (params = {}) => tsMin(params.window),
  tsMax: (params = {}) => tsMax(params.window),
  tsArgmax: (params = {}) => tsArgmax(params.window),
  tsArgmin: (params = {}) => tsArgmin(params.window),
  tsRank: (params = {}) => tsRank(params.window),
  tsDelay: (params = {}) => tsDelay(params.lag),
  tsDelta: (params = {}) => tsDelta(params.lag),
  decayLinear: (params = {}) => decayLinear(params.window),
  csRank: () => csRank(),
  csZscore: () => csZscore(),
  csDemean: () => csDemean(),
  csWinsorize: (params = {}) => csWinsorize(params.lower, params.upper),
  csTruncate: (params = {}) => csTruncate(params.maxFraction),
  csScale: (params = {}) => csScale(params.gross),
  toReturns: () => toReturnsOperator(),
  fracDiff: (params = {}) => fracDiff(params.d, params.threshold),
}
