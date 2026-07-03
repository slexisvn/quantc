import type { Graph } from '../../ir/graph'
import { topoSort } from '../../ir/topo'
import { cudaExpression, cudaReference, graphInputIds, isReduction } from '../emit'

export interface CompiledCudaKernel {
  readonly source: string
  readonly name: string
  readonly batchInputs: number[]
  readonly scalarInputs: number[]
}

export function compileCudaKernel(graph: Graph, name = 'price_kernel'): CompiledCudaKernel {
  if (graph.output === null || graph.output.kind !== 'scalar') throw new Error('cuda kernel output must be a scalar reduction')

  const order = topoSort(graph)
  const { scalarInputs, batchInputs } = graphInputIds(graph)

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
    else if (node.result.kind === 'scalar') body.push(`  const double v${node.result.id} = ${cudaExpression(node.op, node.operands.map(cudaReference), node.attrs)};`)
  }

  const loopBody: string[] = []
  for (const node of order) {
    if (node.result.kind === 'batch' && !isReduction(node.op)) {
      loopBody.push(`    const double b${node.result.id} = ${cudaExpression(node.op, node.operands.map(cudaReference), node.attrs)};`)
    }
  }
  const reduction = reductions[reductions.length - 1]
  const reductionOperand = cudaReference(reduction.operands[0])

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
