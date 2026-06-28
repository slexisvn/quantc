import type { Graph } from '../ir/graph'
import { PassManager, FixedPointGroup } from './pass'
import { ConstantFoldPass } from './constant-fold'
import { AlgebraicSimplificationPass } from './algebraic'
import { CommonSubexpressionPass } from './cse'
import { DeadCodeEliminationPass } from './dce'

export function optimize(graph: Graph): boolean {
  const manager = new PassManager()
  manager.add(
    new FixedPointGroup('simplify', [
      new ConstantFoldPass(),
      new AlgebraicSimplificationPass(),
      new CommonSubexpressionPass(),
      new DeadCodeEliminationPass(),
    ]),
  )
  return manager.run(graph)
}
