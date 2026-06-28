import type { Graph } from '../ir/graph'
import { pruneDeadNodes } from '../ir/rewrite'
import type { GraphPass } from './pass'

export class DeadCodeEliminationPass implements GraphPass {
  readonly name = 'dce'

  run(graph: Graph): boolean {
    return pruneDeadNodes(graph) > 0
  }
}
