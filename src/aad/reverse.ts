import type { Graph } from '../ir/graph'
import { topoSort } from '../ir/topo'
import { registry } from '../ir/op-registry'
import { GradAccumulator } from './grad-accumulator'
import { requireValue } from './values'

function reduceToLength(grad: Float64Array, target: number): Float64Array {
  if (grad.length === target) return grad
  if (target === 1) {
    let total = 0
    for (let i = 0; i < grad.length; i += 1) total += grad[i]
    return new Float64Array([total])
  }
  throw new Error(`cannot reduce gradient of length ${grad.length} to ${target}`)
}

export function reverse(graph: Graph, forward: Map<number, Float64Array>, seeds: Map<number, Float64Array>): Map<number, Float64Array> {
  const accumulator = new GradAccumulator()
  for (const [id, grad] of seeds) accumulator.add(id, grad)

  const order = topoSort(graph)
  for (let k = order.length - 1; k >= 0; k -= 1) {
    const node = order[k]
    if (node.operands.length === 0) continue
    const adjOut = accumulator.get(node.result.id)
    if (adjOut === null) continue
    const operands = node.operands.map((operand) => requireValue(forward, operand.id))
    const result = requireValue(forward, node.result.id)
    const raw = registry.get(node.op).adjointFn(operands, result, adjOut, node.attrs)
    for (let i = 0; i < node.operands.length; i += 1) {
      accumulator.add(node.operands[i].id, reduceToLength(raw[i], operands[i].length))
    }
  }

  const gradients = new Map<number, Float64Array>()
  for (const input of graph.inputs) {
    const grad = accumulator.get(input.id)
    if (grad !== null) gradients.set(input.id, grad)
  }
  return gradients
}
