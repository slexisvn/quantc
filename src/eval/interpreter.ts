import type { Graph } from '../ir/graph'
import { topoSort } from '../ir/topo'
import { registry } from '../ir/op-registry'

function require(values: Map<number, Float64Array>, id: number): Float64Array {
  const value = values.get(id)
  if (value === undefined) throw new Error(`unbound value ${id}`)
  return value
}

export function evaluate(graph: Graph, bindings: Map<number, Float64Array>, batchSize: number): Map<number, Float64Array> {
  const values = new Map<number, Float64Array>(bindings)
  for (const node of topoSort(graph)) {
    const operands = node.operands.map((operand) => require(values, operand.id))
    const outLen = node.result.kind === 'batch' ? batchSize : 1
    const out = registry.get(node.op).evalFn(operands, outLen, node.attrs)
    values.set(node.result.id, out)
  }
  return values
}
