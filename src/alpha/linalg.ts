import { solveLinearSystem } from '../numerics/linalg/solve'
import type { Matrix } from './types'

export function matVec(m: Matrix, v: number[]): number[] {
  return m.map((row) => row.reduce((sum, x, j) => sum + x * v[j], 0))
}

export function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i]
  return sum
}

export function transpose(m: Matrix): Matrix {
  const r = m.length
  const c = r === 0 ? 0 : m[0].length
  const out = Array.from({ length: c }, () => new Array<number>(r).fill(0))
  for (let i = 0; i < r; i += 1) for (let j = 0; j < c; j += 1) out[j][i] = m[i][j]
  return out
}

export function matMul(a: Matrix, b: Matrix): Matrix {
  const r = a.length
  const inner = b.length
  const c = inner === 0 ? 0 : b[0].length
  const out = Array.from({ length: r }, () => new Array<number>(c).fill(0))
  for (let i = 0; i < r; i += 1) {
    for (let k = 0; k < inner; k += 1) {
      const aik = a[i][k]
      if (aik === 0) continue
      for (let j = 0; j < c; j += 1) out[i][j] += aik * b[k][j]
    }
  }
  return out
}

export function scaleMatrix(m: Matrix, factor: number): Matrix {
  return m.map((row) => row.map((x) => x * factor))
}

export function addMatrices(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((x, j) => x + b[i][j]))
}

export function identity(n: number): Matrix {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

export function invert(m: Matrix): Matrix {
  const n = m.length
  const inv = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let j = 0; j < n; j += 1) {
    const basis = new Array<number>(n).fill(0)
    basis[j] = 1
    const col = solveLinearSystem(m, basis)
    for (let i = 0; i < n; i += 1) inv[i][j] = col[i]
  }
  return inv
}
