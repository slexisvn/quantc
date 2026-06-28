import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { topoSort } from '../ir/topo'
import { registerSymbolicVjps, getSymbolicVjp } from './vjp-symbolic'

class SymbolicAccumulator {
  private readonly pending = new Map<number, Value[]>()

  constructor(private readonly graph: Graph) {}

  add(id: number, value: Value): void {
    const existing = this.pending.get(id)
    if (existing !== undefined) existing.push(value)
    else this.pending.set(id, [value])
  }

  get(id: number): Value | null {
    const values = this.pending.get(id)
    if (values === undefined || values.length === 0) return null
    let level = values
    while (level.length > 1) {
      const next: Value[] = []
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 < level.length) next.push(this.graph.add(level[i], level[i + 1]))
        else next.push(level[i])
      }
      level = next
    }
    return level[0]
  }
}

export interface BackwardGraph {
  readonly graph: Graph
  readonly gradients: Map<number, Value>
  readonly batchSize: Value
}

export function buildBackwardGraph(graph: Graph, output: Value, inputs: readonly Value[]): BackwardGraph {
  registerSymbolicVjps()
  const batchSize = graph.input('scalar', 'batchSize')
  const accumulator = new SymbolicAccumulator(graph)
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
