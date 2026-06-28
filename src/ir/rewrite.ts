import type { Graph } from './graph'
import type { Value } from './value'

export function isConstant(value: Value): boolean {
  return value.producer !== null && value.producer.op === 'const'
}

export function constantValue(value: Value): number {
  if (value.producer === null) throw new Error('value is not a constant')
  return value.producer.attrs.value as number
}

export function replaceAllUsesWith(oldValue: Value, newValue: Value): void {
  if (oldValue === newValue) return
  for (const use of oldValue.uses) {
    use.node.operands[use.index] = newValue
    newValue.uses.push(use)
  }
  oldValue.uses.length = 0
}

export function rebuildUses(graph: Graph): void {
  for (const input of graph.inputs) input.uses.length = 0
  for (const node of graph.nodes) node.result.uses.length = 0
  for (const node of graph.nodes) {
    for (let i = 0; i < node.operands.length; i += 1) node.operands[i].uses.push({ node, index: i })
  }
}

export function pruneDeadNodes(graph: Graph): number {
  const reachable = new Set<number>()
  const stack: Value[] = []
  if (graph.output !== null) stack.push(graph.output)
  while (stack.length > 0) {
    const value = stack.pop()
    if (value === undefined) continue
    const producer = value.producer
    if (producer === null || reachable.has(producer.id)) continue
    reachable.add(producer.id)
    for (const operand of producer.operands) stack.push(operand)
  }

  const before = graph.nodes.length
  const live = graph.nodes.filter((node) => reachable.has(node.id))
  graph.nodes.length = 0
  for (const node of live) graph.nodes.push(node)
  rebuildUses(graph)
  return before - graph.nodes.length
}
