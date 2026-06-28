import type { Graph } from '../ir/graph'
import { topoSort } from '../ir/topo'
import { registry } from '../ir/op-registry'
import { isConstant, constantValue, replaceAllUsesWith, pruneDeadNodes } from '../ir/rewrite'
import type { GraphPass } from './pass'

export class ConstantFoldPass implements GraphPass {
  readonly name = 'constant-fold'

  run(graph: Graph): boolean {
    let changed = false
    for (const node of topoSort(graph)) {
      if (node.op === 'const' || node.operands.length === 0) continue
      if (!node.operands.every((operand) => isConstant(operand))) continue
      const operandValues = node.operands.map((operand) => new Float64Array([constantValue(operand)]))
      const folded = registry.get(node.op).evalFn(operandValues, 1, node.attrs)
      const replacement = graph.constant(folded[0])
      replaceAllUsesWith(node.result, replacement)
      changed = true
    }
    if (changed) pruneDeadNodes(graph)
    return changed
  }
}
