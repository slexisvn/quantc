import type { OpDef } from '../op-registry'
import { elementwiseKind, at } from './helpers'

export type BinaryForward = (a: number, b: number) => number
export type BinaryAdjoint = (a: number, b: number, y: number, g: number) => [number, number]
export type UnaryForward = (a: number) => number
export type UnaryAdjoint = (a: number, y: number, g: number) => number

export function binaryOp(name: string, forward: BinaryForward, adjoint: BinaryAdjoint): OpDef {
  return {
    name,
    arity: 2,
    inferKind: (kinds) => elementwiseKind(kinds),
    evalFn: (operands, outLen) => {
      const a = operands[0]
      const b = operands[1]
      const out = new Float64Array(outLen)
      for (let i = 0; i < outLen; i += 1) out[i] = forward(at(a, i), at(b, i))
      return out
    },
    adjointFn: (operands, result, adjOut) => {
      const a = operands[0]
      const b = operands[1]
      const n = adjOut.length
      const gradA = new Float64Array(n)
      const gradB = new Float64Array(n)
      for (let i = 0; i < n; i += 1) {
        const pair = adjoint(at(a, i), at(b, i), at(result, i), adjOut[i])
        gradA[i] = pair[0]
        gradB[i] = pair[1]
      }
      return [gradA, gradB]
    },
    jvpFn: (operands, tangents, result, outLen) => {
      const a = operands[0]
      const b = operands[1]
      const da = tangents[0]
      const db = tangents[1]
      const out = new Float64Array(outLen)
      for (let i = 0; i < outLen; i += 1) {
        const partial = adjoint(at(a, i), at(b, i), at(result, i), 1)
        out[i] = partial[0] * at(da, i) + partial[1] * at(db, i)
      }
      return out
    },
  }
}

export function unaryOp(name: string, forward: UnaryForward, adjoint: UnaryAdjoint): OpDef {
  return {
    name,
    arity: 1,
    inferKind: (kinds) => elementwiseKind(kinds),
    evalFn: (operands, outLen) => {
      const a = operands[0]
      const out = new Float64Array(outLen)
      for (let i = 0; i < outLen; i += 1) out[i] = forward(at(a, i))
      return out
    },
    adjointFn: (operands, result, adjOut) => {
      const a = operands[0]
      const n = adjOut.length
      const gradA = new Float64Array(n)
      for (let i = 0; i < n; i += 1) gradA[i] = adjoint(at(a, i), at(result, i), adjOut[i])
      return [gradA]
    },
    jvpFn: (operands, tangents, result, outLen) => {
      const a = operands[0]
      const da = tangents[0]
      const out = new Float64Array(outLen)
      for (let i = 0; i < outLen; i += 1) out[i] = adjoint(at(a, i), at(result, i), 1) * at(da, i)
      return out
    },
  }
}
