import type { Graph } from '../../ir/graph'
import type { Value } from '../../ir/value'
import { topoSort } from '../../ir/topo'
import { cudaExpression, isReduction } from '../emit'

export interface CompiledCudaAadKernel {
  readonly source: string
  readonly name: string
  readonly scalarInputs: number[]
  readonly batchInputs: number[]
  readonly reductionIds: number[]
}

function reference(value: Value): string {
  if (value.producer === null) {
    return value.kind === 'batch' ? `x${value.id}[i]` : `s${value.id}`
  }
  return value.kind === 'batch' ? `b${value.id}` : `v${value.id}`
}

export function compileCudaAadKernel(graph: Graph, name = 'aad_kernel'): CompiledCudaAadKernel {
  const order = topoSort(graph)
  const scalarInputs = graph.inputs.filter((value) => value.kind === 'scalar').map((value) => value.id)
  const batchInputs = graph.inputs.filter((value) => value.kind === 'batch').map((value) => value.id)

  const postSet = new Set<number>()
  const scalarPre: typeof order = []
  const batch: typeof order = []
  const reductions: typeof order = []
  for (const node of order) {
    if (isReduction(node.op)) {
      reductions.push(node)
      postSet.add(node.result.id)
      continue
    }
    if (node.result.kind === 'batch') {
      batch.push(node)
      continue
    }
    if (node.operands.some((operand) => postSet.has(operand.id))) postSet.add(node.result.id)
    else scalarPre.push(node)
  }

  const signature = [
    ...scalarInputs.map((id) => `const double s${id}`),
    ...batchInputs.map((id) => `const double* __restrict__ x${id}`),
    ...reductions.map((_node, k) => `double* __restrict__ r${k}`),
    'const int N',
  ]

  const lines = [
    `extern "C" __global__ void ${name}(${signature.join(', ')}) {`,
    '  const int i = blockIdx.x * blockDim.x + threadIdx.x;',
    '  if (i >= N) return;',
    ...scalarPre.map((node) => `  const double v${node.result.id} = ${cudaExpression(node.op, node.operands.map(reference), node.attrs)};`),
    ...batch.map((node) => `  const double b${node.result.id} = ${cudaExpression(node.op, node.operands.map(reference), node.attrs)};`),
    ...reductions.map((node, k) => `  atomicAdd(r${k}, ${reference(node.operands[0])}${node.op === 'mean' ? ' / (double) N' : ''});`),
    '}',
  ]

  return { source: lines.join('\n'), name, scalarInputs, batchInputs, reductionIds: reductions.map((node) => node.result.id) }
}
