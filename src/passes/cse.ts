import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { topoSort } from '../ir/topo'
import { replaceAllUsesWith, pruneDeadNodes } from '../ir/rewrite'
import type { GraphPass } from './pass'

function attributeKey(attrs: Readonly<Record<string, unknown>>): string {
  const keys = Object.keys(attrs).sort()
  return keys.map((key) => `${key}=${String(attrs[key])}`).join(',')
}

export class CommonSubexpressionPass implements GraphPass {
  readonly name = 'cse'

  run(graph: Graph): boolean {
    let changed = false
    const seen = new Map<string, Value>()
    for (const node of topoSort(graph)) {
      const key = `${node.op}|${node.operands.map((operand) => operand.id).join(',')}|${attributeKey(node.attrs)}`
      const existing = seen.get(key)
      if (existing === undefined) {
        seen.set(key, node.result)
        continue
      }
      replaceAllUsesWith(node.result, existing)
      changed = true
    }
    if (changed) pruneDeadNodes(graph)
    return changed
  }
}
