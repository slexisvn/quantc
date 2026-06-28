import type { Graph } from '../../ir/graph'
import type { Value } from '../../ir/value'
import { topoSort } from '../../ir/topo'
import { scalarExpression, isReduction } from '../emit'

export interface CompiledCpuKernel {
  readonly source: string
  readonly run: (inputs: Map<number, Float64Array>, batchSize: number) => number
}

export interface CompiledCpuMultiKernel {
  readonly source: string
  readonly run: (inputs: Map<number, Float64Array>, batchSize: number) => Float64Array
}

function reference(value: Value, postSet: Set<number>): string {
  if (value.producer === null) {
    return value.kind === 'batch' ? `x${value.id}[i]` : `s${value.id}`
  }
  if (postSet.has(value.id) || value.kind === 'scalar') return `v${value.id}`
  return `b${value.id}`
}

export function compileCpuMultiKernel(graph: Graph, outputs: readonly Value[]): CompiledCpuMultiKernel {
  for (const output of outputs) {
    if (output.kind !== 'scalar') throw new Error('cpu kernel outputs must be scalar')
  }

  const order = topoSort(graph)
  const postSet = new Set<number>()
  const scalarPre: typeof order = []
  const batch: typeof order = []
  const reductions: typeof order = []
  const scalarPost: typeof order = []

  for (const node of order) {
    if (isReduction(node.op)) {
      reductions.push(node)
      postSet.add(node.result.id)
      continue
    }
    if (node.result.kind === 'batch') {
      for (const operand of node.operands) {
        if (postSet.has(operand.id)) throw new Error('batch op depends on a reduction; unsupported fusion pattern')
      }
      batch.push(node)
      continue
    }
    const dependsOnReduction = node.operands.some((operand) => postSet.has(operand.id))
    if (dependsOnReduction) {
      scalarPost.push(node)
      postSet.add(node.result.id)
    } else {
      scalarPre.push(node)
    }
  }

  const lines: string[] = []
  for (const input of graph.inputs) {
    if (input.kind === 'scalar') lines.push(`const s${input.id} = inputs.get(${input.id})[0];`)
    else lines.push(`const x${input.id} = inputs.get(${input.id});`)
  }
  const emit = (node: (typeof order)[number]): string => scalarExpression(node.op, node.operands.map((operand) => reference(operand, postSet)), node.attrs)

  for (const node of scalarPre) lines.push(`const v${node.result.id} = ${emit(node)};`)
  for (const node of reductions) lines.push(`let acc${node.result.id} = 0;`)

  lines.push('for (let i = 0; i < N; i += 1) {')
  for (const node of batch) lines.push(`  const b${node.result.id} = ${emit(node)};`)
  for (const node of reductions) lines.push(`  acc${node.result.id} += ${reference(node.operands[0], postSet)};`)
  lines.push('}')

  for (const node of reductions) lines.push(`const v${node.result.id} = acc${node.result.id}${node.op === 'mean' ? ' / N' : ''};`)
  for (const node of scalarPost) lines.push(`const v${node.result.id} = ${emit(node)};`)
  lines.push(`return [${outputs.map((output) => `v${output.id}`).join(', ')}];`)

  const source = lines.join('\n')
  const factory = new Function('inputs', 'N', source) as (inputs: Map<number, Float64Array>, batchSize: number) => number[]
  return { source, run: (inputs, batchSize) => Float64Array.from(factory(inputs, batchSize)) }
}

export function compileCpuKernel(graph: Graph): CompiledCpuKernel {
  if (graph.output === null) throw new Error('graph has no output')
  const multi = compileCpuMultiKernel(graph, [graph.output])
  return { source: multi.source, run: (inputs, batchSize) => multi.run(inputs, batchSize)[0] }
}
