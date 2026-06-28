import { Graph } from '../ir/graph'
import { registerBuiltinOps } from '../ir/ops/index'
import { models, type ModelContext } from '../models/model-registry'
import { registerBuiltinModels } from '../models/index'
import { parsePayoff } from '../script/parser'
import { lowerPayoff } from '../script/lower'
import type { Value } from '../ir/value'

export interface EuropeanGraphInputs {
  readonly spot: Value
  readonly strike: Value
  readonly rate: Value
  readonly vol: Value
  readonly maturity: Value
  readonly normals: Value
}

export interface EuropeanGraph {
  readonly graph: Graph
  readonly inputs: EuropeanGraphInputs
  readonly price: Value
  readonly discounted: Value
}

export function buildEuropeanGraph(payoff: string, model: string): EuropeanGraph {
  registerBuiltinOps()
  registerBuiltinModels()

  const graph = new Graph()
  const spot = graph.input('scalar', 'spot')
  const strike = graph.input('scalar', 'strike')
  const rate = graph.input('scalar', 'rate')
  const vol = graph.input('scalar', 'vol')
  const maturity = graph.input('scalar', 'maturity')
  const normals = graph.input('batch', 'normals')

  const context: ModelContext = { graph, spot, rate, vol, maturity, normals }
  const terminal = models.get(model).terminal(context)

  const environment = new Map<string, Value>([
    ['spot', terminal],
    ['strike', strike],
    ['rate', rate],
    ['vol', vol],
    ['maturity', maturity],
  ])
  const payoffValue = lowerPayoff(parsePayoff(payoff), graph, environment)
  const discount = graph.exp(graph.neg(graph.mul(rate, maturity)))
  const discounted = graph.mul(discount, payoffValue)
  const price = graph.mean(discounted)
  graph.output = price

  return { graph, inputs: { spot, strike, rate, vol, maturity, normals }, price, discounted }
}
