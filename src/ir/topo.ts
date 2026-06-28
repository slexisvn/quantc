import type { Graph } from './graph'
import type { Node } from './node'

export function topoSort(graph: Graph): Node[] {
  const indegree = new Map<number, number>()
  for (const node of graph.nodes) {
    let dependencies = 0
    for (const operand of node.operands) {
      if (operand.producer !== null) dependencies += 1
    }
    indegree.set(node.id, dependencies)
  }

  const order: Node[] = []
  const queue: Node[] = []
  for (const node of graph.nodes) {
    if (indegree.get(node.id) === 0) queue.push(node)
  }

  let head = 0
  while (head < queue.length) {
    const node = queue[head]
    head += 1
    order.push(node)
    for (const use of node.result.uses) {
      const consumer = use.node
      const remaining = (indegree.get(consumer.id) ?? 0) - 1
      indegree.set(consumer.id, remaining)
      if (remaining === 0) queue.push(consumer)
    }
  }

  if (order.length !== graph.nodes.length) throw new Error('graph contains a cycle')
  return order
}
