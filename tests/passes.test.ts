import { describe, it, expect } from 'vitest'
import { Graph } from '../src/ir/graph'
import { registerBuiltinOps } from '../src/ir/ops/index'
import { evaluate } from '../src/eval/interpreter'
import { reverse } from '../src/aad/reverse'
import { optimize } from '../src/passes/pipeline'
import { ConstantFoldPass } from '../src/passes/constant-fold'
import { CommonSubexpressionPass } from '../src/passes/cse'
import { buildEuropeanGraph } from '../src/engines/european-graph'
import { standardNormals } from '../src/numerics/sampling'

registerBuiltinOps()

describe('IR optimization passes', () => {
  it('constant-folds a pure-constant subexpression', () => {
    const graph = new Graph()
    const x = graph.input('batch', 'x')
    const folded = graph.add(graph.mul(graph.constant(2), graph.constant(5)), graph.constant(3))
    const out = graph.add(x, folded)
    graph.output = out
    new ConstantFoldPass().run(graph)
    const constants = graph.nodes.filter((node) => node.op === 'const' && node.result.uses.length > 0)
    expect(constants.some((node) => node.attrs.value === 13)).toBe(true)
    const result = evaluate(graph, new Map([[x.id, new Float64Array([1, 2])]]), 2)
    expect(Array.from(result.get(out.id)!)).toEqual([14, 15])
  })

  it('eliminates a common subexpression', () => {
    const graph = new Graph()
    const x = graph.input('batch', 'x')
    const a = graph.add(graph.mul(x, graph.constant(2)), graph.constant(3))
    const b = graph.add(graph.mul(x, graph.constant(2)), graph.constant(3))
    const out = graph.mul(a, b)
    graph.output = out
    const before = graph.nodes.length
    new CommonSubexpressionPass().run(graph)
    expect(graph.nodes.length).toBeLessThan(before)
    const result = evaluate(graph, new Map([[x.id, new Float64Array([4])]]), 1)
    expect(result.get(out.id)![0]).toBeCloseTo(121, 10)
  })

  it('preserves European price and AAD delta after optimization, and is idempotent', () => {
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const paths = 20000
    const inputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, standardNormals(paths, 1)],
    ])
    const beforePrice = evaluate(built.graph, inputs, paths).get(built.price.id)![0]
    const beforeGrads = reverse(built.graph, evaluate(built.graph, inputs, paths), new Map([[built.price.id, new Float64Array([1])]]))
    const beforeDelta = beforeGrads.get(built.inputs.spot.id)![0]
    const beforeNodes = built.graph.nodes.length

    optimize(built.graph)
    const afterNodes = built.graph.nodes.length
    const secondPass = optimize(built.graph)

    const forward = evaluate(built.graph, inputs, paths)
    const afterPrice = forward.get(built.price.id)![0]
    const afterGrads = reverse(built.graph, forward, new Map([[built.price.id, new Float64Array([1])]]))
    const afterDelta = afterGrads.get(built.inputs.spot.id)![0]

    expect(afterPrice).toBeCloseTo(beforePrice, 10)
    expect(afterDelta).toBeCloseTo(beforeDelta, 10)
    expect(afterNodes).toBeLessThanOrEqual(beforeNodes)
    expect(secondPass).toBe(false)
  })
})
