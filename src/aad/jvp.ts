import type { Graph } from '../ir/graph'
import { topoSort } from '../ir/topo'
import { registry } from '../ir/op-registry'
import { evaluate } from '../eval/interpreter'
import { requireValue } from './values'

export interface ForwardModeResult {
  readonly primals: Map<number, Float64Array>
  readonly tangents: Map<number, Float64Array>
}

export function forwardMode(graph: Graph, bindings: Map<number, Float64Array>, seeds: Map<number, Float64Array>, batchSize: number): ForwardModeResult {
  const primals = evaluate(graph, bindings, batchSize)
  const tangents = new Map<number, Float64Array>()
  for (const input of graph.inputs) {
    const seed = seeds.get(input.id)
    const primal = requireValue(primals, input.id)
    tangents.set(input.id, seed ?? new Float64Array(primal.length))
  }

  for (const node of topoSort(graph)) {
    const operandPrimals = node.operands.map((operand) => requireValue(primals, operand.id))
    const operandTangents = node.operands.map((operand) => tangents.get(operand.id) ?? new Float64Array(requireValue(primals, operand.id).length))
    const outLen = node.result.kind === 'batch' ? batchSize : 1
    const tangent = registry.get(node.op).jvpFn(operandPrimals, operandTangents, requireValue(primals, node.result.id), outLen, node.attrs)
    tangents.set(node.result.id, tangent)
  }

  return { primals, tangents }
}
