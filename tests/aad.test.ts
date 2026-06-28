import { describe, it, expect } from 'vitest'
import { Graph } from '../src/ir/graph'
import { registerBuiltinOps } from '../src/ir/ops/index'
import { evaluate } from '../src/eval/interpreter'
import { reverse } from '../src/aad/reverse'

registerBuiltinOps()

describe('reverse-mode AAD', () => {
  it('differentiates a scalar polynomial', () => {
    const graph = new Graph()
    const x = graph.input('scalar', 'x')
    const y = graph.mul(graph.mul(x, x), graph.constant(3))
    graph.output = y
    const forward = evaluate(graph, new Map([[x.id, new Float64Array([2])]]), 1)
    const gradients = reverse(graph, forward, new Map([[y.id, new Float64Array([1])]]))
    expect(gradients.get(x.id)![0]).toBeCloseTo(12, 10)
  })

  it('reduces broadcast gradients of a scalar consumed across a batch', () => {
    const graph = new Graph()
    const a = graph.input('scalar', 'a')
    const z = graph.input('batch', 'z')
    const mean = graph.mean(graph.mul(a, z))
    graph.output = mean
    const forward = evaluate(graph, new Map([[a.id, new Float64Array([2])], [z.id, new Float64Array([1, 2, 3])]]), 3)
    const gradients = reverse(graph, forward, new Map([[mean.id, new Float64Array([1])]]))
    expect(gradients.get(a.id)![0]).toBeCloseTo(2, 12)
    expect(Array.from(gradients.get(z.id)!)).toEqual([2 / 3, 2 / 3, 2 / 3])
  })

  it('matches the subgradient of a kinked payoff', () => {
    const graph = new Graph()
    const x = graph.input('batch', 'x')
    const payoff = graph.max(graph.sub(x, graph.constant(0)), graph.constant(0))
    const mean = graph.mean(payoff)
    graph.output = mean
    const forward = evaluate(graph, new Map([[x.id, new Float64Array([-1, 2, 5, -3])]]), 4)
    const gradients = reverse(graph, forward, new Map([[mean.id, new Float64Array([1])]]))
    expect(Array.from(gradients.get(x.id)!)).toEqual([0, 1 / 4, 1 / 4, 0])
  })
})
