import { forwardMode } from './jvp'
import type { BackwardGraph } from './backward-graph'

export function forwardOverReverse(backward: BackwardGraph, bindings: Map<number, Float64Array>, seedInputId: number, batchSize: number): Map<number, number> {
  const seeds = new Map<number, Float64Array>([[seedInputId, new Float64Array([1])]])
  const { tangents } = forwardMode(backward.graph, bindings, seeds, batchSize)

  const hessianColumn = new Map<number, number>()
  for (const [inputId, gradient] of backward.gradients) {
    const tangent = tangents.get(gradient.id)
    hessianColumn.set(inputId, tangent === undefined ? 0 : tangent[0])
  }
  return hessianColumn
}
