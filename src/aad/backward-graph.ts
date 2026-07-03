import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { topoSort } from '../ir/topo'
import { registerSymbolicVjps, getSymbolicVjp } from './vjp-symbolic'
import { Accumulator } from './accumulator'

export interface BackwardGraph {
  readonly graph: Graph
  readonly gradients: Map<number, Value>
  readonly batchSize: Value
}

export function buildBackwardGraph(graph: Graph, output: Value, inputs: readonly Value[]): BackwardGraph {
  registerSymbolicVjps()
  const batchSize = graph.input('scalar', 'batchSize')
  const accumulator = new Accumulator<Value>((a, b) => graph.add(a, b))
  accumulator.add(output.id, graph.constant(1))

  const order = topoSort(graph)
  for (let k = order.length - 1; k >= 0; k -= 1) {
    const node = order[k]
    if (node.operands.length === 0) continue
    const adjOut = accumulator.get(node.result.id)
    if (adjOut === null) continue
    const adjoints = getSymbolicVjp(node.op)({ graph, operands: node.operands, result: node.result, adjOut, batchSize })
    for (let i = 0; i < node.operands.length; i += 1) {
      const operand = node.operands[i]
      let adjoint = adjoints[i]
      if (operand.kind === 'scalar' && adjoint.kind === 'batch') adjoint = graph.sum(adjoint)
      accumulator.add(operand.id, adjoint)
    }
  }

  const gradients = new Map<number, Value>()
  for (const input of inputs) {
    const gradient = accumulator.get(input.id)
    if (gradient !== null) gradients.set(input.id, gradient)
  }
  return { graph, gradients, batchSize }
}
