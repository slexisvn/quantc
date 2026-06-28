import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { evaluate } from '../eval/interpreter'
import { reverse } from '../aad/reverse'
import { Welford } from '../numerics/stats/welford'

export interface McOutput {
  readonly price: number
  readonly standardError: number
  readonly gradients: ReadonlyMap<number, number>
}

function requireValue(values: Map<number, Float64Array>, id: number): Float64Array {
  const value = values.get(id)
  if (value === undefined) throw new Error(`missing value ${id}`)
  return value
}

export function runMonteCarlo(graph: Graph, bindings: Map<number, Float64Array>, batchSize: number, price: Value, sample: Value, riskFactors: readonly Value[]): McOutput {
  const forward = evaluate(graph, bindings, batchSize)
  const priceValue = requireValue(forward, price.id)[0]

  const samples = requireValue(forward, sample.id)
  const welford = new Welford()
  for (let i = 0; i < samples.length; i += 1) welford.push(samples[i])

  const adjoints = reverse(graph, forward, new Map([[price.id, new Float64Array([1])]]))
  const gradients = new Map<number, number>()
  for (const factor of riskFactors) {
    const grad = adjoints.get(factor.id)
    gradients.set(factor.id, grad === undefined ? 0 : grad[0])
  }

  return { price: priceValue, standardError: welford.standardError, gradients }
}
