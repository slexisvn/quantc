import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'

export interface VjpContext {
  readonly graph: Graph
  readonly operands: readonly Value[]
  readonly result: Value
  readonly adjOut: Value
  readonly batchSize: Value
}

export type SymbolicVjp = (ctx: VjpContext) => Value[]

const rules = new Map<string, SymbolicVjp>()

export function registerSymbolicVjp(op: string, rule: SymbolicVjp): void {
  if (rules.has(op)) throw new Error(`duplicate symbolic VJP ${op}`)
  rules.set(op, rule)
}

export function getSymbolicVjp(op: string): SymbolicVjp {
  const rule = rules.get(op)
  if (rule === undefined) throw new Error(`no symbolic VJP for op ${op}`)
  return rule
}

let registered = false

export function registerSymbolicVjps(): void {
  if (registered) return
  const indicator = (g: Graph, left: Value, right: Value): Value => g.emit('ge', [left, right], {}, 'ge')

  registerSymbolicVjp('add', ({ adjOut }) => [adjOut, adjOut])
  registerSymbolicVjp('sub', ({ graph, adjOut }) => [adjOut, graph.neg(adjOut)])
  registerSymbolicVjp('mul', ({ graph, operands, adjOut }) => [graph.mul(adjOut, operands[1]), graph.mul(adjOut, operands[0])])
  registerSymbolicVjp('div', ({ graph, operands, adjOut }) => [
    graph.div(adjOut, operands[1]),
    graph.neg(graph.div(graph.mul(adjOut, operands[0]), graph.mul(operands[1], operands[1]))),
  ])
  registerSymbolicVjp('neg', ({ graph, adjOut }) => [graph.neg(adjOut)])
  registerSymbolicVjp('exp', ({ graph, result, adjOut }) => [graph.mul(adjOut, result)])
  registerSymbolicVjp('log', ({ graph, operands, adjOut }) => [graph.div(adjOut, operands[0])])
  registerSymbolicVjp('sqrt', ({ graph, result, adjOut }) => [graph.div(adjOut, graph.mul(graph.constant(2), result))])
  registerSymbolicVjp('sigmoid', ({ graph, result, adjOut }) => [graph.mul(adjOut, graph.mul(result, graph.sub(graph.constant(1), result)))])
  registerSymbolicVjp('softplus', ({ graph, operands, adjOut }) => [graph.mul(adjOut, graph.sigmoid(operands[0]))])
  registerSymbolicVjp('max', ({ graph, operands, adjOut }) => {
    const ind = indicator(graph, operands[0], operands[1])
    return [graph.mul(adjOut, ind), graph.mul(adjOut, graph.sub(graph.constant(1), ind))]
  })
  registerSymbolicVjp('min', ({ graph, operands, adjOut }) => {
    const ind = indicator(graph, operands[1], operands[0])
    return [graph.mul(adjOut, ind), graph.mul(adjOut, graph.sub(graph.constant(1), ind))]
  })
  registerSymbolicVjp('mean', ({ graph, adjOut, batchSize }) => [graph.div(adjOut, batchSize)])
  registerSymbolicVjp('sum', ({ adjOut }) => [adjOut])
  registered = true
}
