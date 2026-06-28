import type { Graph } from '../../ir/graph'
import type { Value } from '../../ir/value'
import { topoSort } from '../../ir/topo'
import { cudaExpression, isReduction } from '../emit'

export interface CompiledCudaKernel {
  readonly source: string
  readonly name: string
  readonly batchInputs: number[]
  readonly scalarInputs: number[]
}

function reference(value: Value): string {
  if (value.producer === null) {
    return value.kind === 'batch' ? `x${value.id}[i]` : `s${value.id}`
  }
  return value.kind === 'batch' ? `b${value.id}` : `v${value.id}`
}

export function compileCudaKernel(graph: Graph, name = 'price_kernel'): CompiledCudaKernel {
  if (graph.output === null || graph.output.kind !== 'scalar') throw new Error('cuda kernel output must be a scalar reduction')

  const order = topoSort(graph)
  const scalarInputs = graph.inputs.filter((value) => value.kind === 'scalar').map((value) => value.id)
  const batchInputs = graph.inputs.filter((value) => value.kind === 'batch').map((value) => value.id)

  const signatureParts = [
    ...scalarInputs.map((id) => `const double s${id}`),
    ...batchInputs.map((id) => `const double* __restrict__ x${id}`),
    'double* __restrict__ result',
    'const int N',
  ]

  const body: string[] = []
  const reductions: typeof order = []
  for (const node of order) {
    if (isReduction(node.op)) reductions.push(node)
    else if (node.result.kind === 'scalar') body.push(`  const double v${node.result.id} = ${cudaExpression(node.op, node.operands.map(reference), node.attrs)};`)
  }

  const loopBody: string[] = []
  for (const node of order) {
    if (node.result.kind === 'batch' && !isReduction(node.op)) {
      loopBody.push(`    const double b${node.result.id} = ${cudaExpression(node.op, node.operands.map(reference), node.attrs)};`)
    }
  }
  const reduction = reductions[reductions.length - 1]
  const reductionOperand = reference(reduction.operands[0])

  const lines = [
    `extern "C" __global__ void ${name}(${signatureParts.join(', ')}) {`,
    '  const int i = blockIdx.x * blockDim.x + threadIdx.x;',
    '  if (i >= N) return;',
    ...body,
    ...loopBody,
    `  atomicAdd(result, ${reductionOperand}${reduction.op === 'mean' ? ' / (double) N' : ''});`,
    '}',
  ]

  return { source: lines.join('\n'), name, batchInputs, scalarInputs }
}
