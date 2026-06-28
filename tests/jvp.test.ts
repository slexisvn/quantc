import { describe, it, expect } from 'vitest'
import { Graph } from '../src/ir/graph'
import { registerBuiltinOps } from '../src/ir/ops/index'
import { reverse } from '../src/aad/reverse'
import { evaluate } from '../src/eval/interpreter'
import { forwardMode } from '../src/aad/jvp'

registerBuiltinOps()

describe('forward-mode AD (JVP)', () => {
  it('directional derivative matches reverse-mode gradient', () => {
    const graph = new Graph()
    const x = graph.input('scalar', 'x')
    const y = graph.input('scalar', 'y')
    const f = graph.add(graph.mul(graph.exp(x), y), graph.mul(x, x))
    graph.output = f
    const bindings = new Map([[x.id, new Float64Array([0.5])], [y.id, new Float64Array([2])]])

    const forward = evaluate(graph, bindings, 1)
    const gradients = reverse(graph, forward, new Map([[f.id, new Float64Array([1])]]))

    const dx = forwardMode(graph, bindings, new Map([[x.id, new Float64Array([1])]]), 1)
    const dy = forwardMode(graph, bindings, new Map([[y.id, new Float64Array([1])]]), 1)

    expect(dx.tangents.get(f.id)![0]).toBeCloseTo(gradients.get(x.id)![0], 10)
    expect(dy.tangents.get(f.id)![0]).toBeCloseTo(gradients.get(y.id)![0], 10)
  })

  it('propagates smoothing-op tangents (sigmoid)', () => {
    const graph = new Graph()
    const x = graph.input('scalar', 'x')
    const y = graph.sigmoid(x)
    graph.output = y
    const bindings = new Map([[x.id, new Float64Array([0.3])]])
    const result = forwardMode(graph, bindings, new Map([[x.id, new Float64Array([1])]]), 1)
    const s = 1 / (1 + Math.exp(-0.3))
    expect(result.tangents.get(y.id)![0]).toBeCloseTo(s * (1 - s), 10)
  })
})
