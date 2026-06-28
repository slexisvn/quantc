import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { topoSort } from '../ir/topo'
import { registry } from '../ir/op-registry'
import { isReduction } from '../backend/emit'

export function evaluateScalarTail(graph: Graph, scalarValues: Map<number, number>, reductionValues: Map<number, number>, outputs: readonly Value[]): Float64Array {
  const values = new Map<number, number>()
  for (const input of graph.inputs) {
    if (input.kind !== 'scalar') continue
    const value = scalarValues.get(input.id)
    if (value !== undefined) values.set(input.id, value)
  }

  for (const node of topoSort(graph)) {
    if (node.result.kind !== 'scalar') continue
    if (isReduction(node.op)) {
      const reduced = reductionValues.get(node.result.id)
      if (reduced === undefined) throw new Error(`missing reduction value ${node.result.id}`)
      values.set(node.result.id, reduced)
      continue
    }
    const operandValues = node.operands.map((operand) => {
      const value = values.get(operand.id)
      if (value === undefined) throw new Error(`missing scalar operand ${operand.id}`)
      return new Float64Array([value])
    })
    const result = registry.get(node.op).evalFn(operandValues, 1, node.attrs)
    values.set(node.result.id, result[0])
  }

  return Float64Array.from(outputs, (output) => {
    const value = values.get(output.id)
    if (value === undefined) throw new Error(`missing output ${output.id}`)
    return value
  })
}
