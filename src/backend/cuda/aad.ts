import type { Value } from '../../ir/value'
import type { BackwardGraph } from '../../aad/backward-graph'
import { compileCudaAadKernel } from './aad-codegen'
import { evaluateScalarTail } from '../../aad/scalar-tail'
import { launchMultiReductionKernel } from '../../runtime/cuda/driver'

export function gpuAadGreeks(backward: BackwardGraph, scalarValues: Map<number, number>, batchData: Map<number, Float64Array>, batchSize: number, outputs: readonly Value[]): Float64Array {
  const kernel = compileCudaAadKernel(backward.graph)
  const reductionValues = launchMultiReductionKernel(kernel, scalarValues, batchData, batchSize)
  return evaluateScalarTail(backward.graph, scalarValues, reductionValues, outputs)
}
