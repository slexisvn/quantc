import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import type { Node } from '../ir/node'
import { topoSort } from '../ir/topo'
import { isConstant, constantValue, replaceAllUsesWith, pruneDeadNodes } from '../ir/rewrite'
import type { GraphPass } from './pass'

function isConstEqual(value: Value, target: number): boolean {
  return isConstant(value) && constantValue(value) === target
}

function simplify(node: Node, graph: Graph): Value | null {
  const operands = node.operands
  switch (node.op) {
    case 'add':
      if (isConstEqual(operands[1], 0)) return operands[0]
      if (isConstEqual(operands[0], 0)) return operands[1]
      return null
    case 'sub':
      if (isConstEqual(operands[1], 0)) return operands[0]
      return null
    case 'mul':
      if (isConstEqual(operands[1], 1)) return operands[0]
      if (isConstEqual(operands[0], 1)) return operands[1]
      if (isConstEqual(operands[1], 0) || isConstEqual(operands[0], 0)) return graph.constant(0)
      return null
    case 'div':
      if (isConstEqual(operands[1], 1)) return operands[0]
      return null
    case 'neg': {
      const inner = operands[0].producer
      if (inner !== null && inner.op === 'neg') return inner.operands[0]
      return null
    }
    default:
      return null
  }
}

export class AlgebraicSimplificationPass implements GraphPass {
  readonly name = 'algebraic'

  run(graph: Graph): boolean {
    let changed = false
    for (const node of topoSort(graph)) {
      const replacement = simplify(node, graph)
      if (replacement === null || replacement === node.result) continue
      if (replacement.kind !== node.result.kind) continue
      replaceAllUsesWith(node.result, replacement)
      changed = true
    }
    if (changed) pruneDeadNodes(graph)
    return changed
  }
}
