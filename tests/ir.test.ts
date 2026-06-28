import { describe, it, expect } from 'vitest'
import { Graph } from '../src/ir/graph'
import { registerBuiltinOps } from '../src/ir/ops/index'
import { evaluate } from '../src/eval/interpreter'

registerBuiltinOps()

describe('vectorised interpreter', () => {
  it('evaluates a batched elementwise expression with a broadcast constant', () => {
    const graph = new Graph()
    const x = graph.input('batch', 'x')
    const expression = graph.add(graph.mul(x, x), graph.constant(2))
    graph.output = expression
    const result = evaluate(graph, new Map([[x.id, new Float64Array([1, 2, 3])]]), 3)
    expect(Array.from(result.get(expression.id)!)).toEqual([3, 6, 11])
  })

  it('reduces a batch to a scalar mean', () => {
    const graph = new Graph()
    const x = graph.input('batch', 'x')
    const mean = graph.mean(x)
    graph.output = mean
    const result = evaluate(graph, new Map([[x.id, new Float64Array([2, 4, 6, 8])]]), 4)
    expect(result.get(mean.id)![0]).toBeCloseTo(5, 12)
  })
})
