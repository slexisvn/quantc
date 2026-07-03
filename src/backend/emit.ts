import type { Node } from '../ir/node'
import type { Value } from '../ir/value'
import type { Graph } from '../ir/graph'

const REDUCTIONS = new Set(['mean', 'sum'])

export function isReduction(op: string): boolean {
  return REDUCTIONS.has(op)
}

export function scalarExpression(op: string, refs: readonly string[], attrs: Readonly<Record<string, unknown>>): string {
  switch (op) {
    case 'const':
      return `(${attrs.value as number})`
    case 'add':
      return `(${refs[0]} + ${refs[1]})`
    case 'sub':
      return `(${refs[0]} - ${refs[1]})`
    case 'mul':
      return `(${refs[0]} * ${refs[1]})`
    case 'div':
      return `(${refs[0]} / ${refs[1]})`
    case 'neg':
      return `(-${refs[0]})`
    case 'exp':
      return `Math.exp(${refs[0]})`
    case 'log':
      return `Math.log(${refs[0]})`
    case 'sqrt':
      return `Math.sqrt(${refs[0]})`
    case 'max':
      return `Math.max(${refs[0]}, ${refs[1]})`
    case 'min':
      return `Math.min(${refs[0]}, ${refs[1]})`
    case 'sigmoid':
      return `(1 / (1 + Math.exp(-(${refs[0]}))))`
    case 'softplus':
      return `((${refs[0]}) > 0 ? (${refs[0]}) + Math.log1p(Math.exp(-(${refs[0]}))) : Math.log1p(Math.exp(${refs[0]})))`
    case 'ge':
      return `((${refs[0]}) >= (${refs[1]}) ? 1 : 0)`
    default:
      throw new Error(`no scalar emitter for op ${op}`)
  }
}

export function cudaExpression(op: string, refs: readonly string[], attrs: Readonly<Record<string, unknown>>): string {
  switch (op) {
    case 'const':
      return `(${(attrs.value as number).toExponential()})`
    case 'add':
      return `(${refs[0]} + ${refs[1]})`
    case 'sub':
      return `(${refs[0]} - ${refs[1]})`
    case 'mul':
      return `(${refs[0]} * ${refs[1]})`
    case 'div':
      return `(${refs[0]} / ${refs[1]})`
    case 'neg':
      return `(-${refs[0]})`
    case 'exp':
      return `exp(${refs[0]})`
    case 'log':
      return `log(${refs[0]})`
    case 'sqrt':
      return `sqrt(${refs[0]})`
    case 'max':
      return `fmax(${refs[0]}, ${refs[1]})`
    case 'min':
      return `fmin(${refs[0]}, ${refs[1]})`
    case 'sigmoid':
      return `(1.0 / (1.0 + exp(-(${refs[0]}))))`
    case 'softplus':
      return `log1p(exp(${refs[0]}))`
    case 'ge':
      return `((${refs[0]}) >= (${refs[1]}) ? 1.0 : 0.0)`
    default:
      throw new Error(`no cuda emitter for op ${op}`)
  }
}

export function cudaReference(value: Value): string {
  if (value.producer === null) {
    return value.kind === 'batch' ? `x${value.id}[i]` : `s${value.id}`
  }
  return value.kind === 'batch' ? `b${value.id}` : `v${value.id}`
}

export function graphInputIds(graph: Graph): { scalarInputs: number[]; batchInputs: number[] } {
  return {
    scalarInputs: graph.inputs.filter((value) => value.kind === 'scalar').map((value) => value.id),
    batchInputs: graph.inputs.filter((value) => value.kind === 'batch').map((value) => value.id),
  }
}

export interface NodePlacement {
  readonly scalarPre: Node[]
  readonly batch: Node[]
  readonly reductions: Node[]
  readonly scalarPost: Node[]
}
