import { describe, it, expect } from 'vitest'
import { Graph } from '../src/ir/graph'
import { registerBuiltinOps } from '../src/ir/ops/index'
import { evaluate } from '../src/eval/interpreter'
import { reverse } from '../src/aad/reverse'
import { buildBackwardGraph } from '../src/aad/backward-graph'
import { forwardOverReverse } from '../src/aad/second-order'
import { buildEuropeanGraph } from '../src/engines/european-graph'
import { standardNormals } from '../src/numerics/sampling'

registerBuiltinOps()

describe('source-transformation AAD (adjoint as graph)', () => {
  it('symbolic backward graph reproduces the numeric reverse gradient exactly', () => {
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const paths = 20000
    const normals = standardNormals(paths, 11)
    const numericInputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, normals],
    ])
    const forward = evaluate(built.graph, numericInputs, paths)
    const numericGrads = reverse(built.graph, forward, new Map([[built.price.id, new Float64Array([1])]]))

    const backward = buildBackwardGraph(built.graph, built.price, [built.inputs.spot, built.inputs.vol, built.inputs.rate, built.inputs.maturity])
    const inputs = new Map(numericInputs)
    inputs.set(backward.batchSize.id, new Float64Array([paths]))
    const augmented = evaluate(backward.graph, inputs, paths)

    for (const input of [built.inputs.spot, built.inputs.vol, built.inputs.rate]) {
      const symbolic = augmented.get(backward.gradients.get(input.id)!.id)![0]
      expect(symbolic).toBeCloseTo(numericGrads.get(input.id)![0], 10)
    }
  })

  it('forward-over-reverse gives the exact second derivative on a smooth function', () => {
    const graph = new Graph()
    const a = graph.input('scalar', 'a')
    const x = graph.input('batch', 'x')
    const y = graph.mean(graph.exp(graph.mul(a, x)))
    graph.output = y

    const xs = new Float64Array([0.1, 0.3, -0.2, 0.5, -0.4])
    const aValue = 0.7
    const backward = buildBackwardGraph(graph, y, [a])
    const bindings = new Map<number, Float64Array>([
      [a.id, new Float64Array([aValue])],
      [x.id, xs],
      [backward.batchSize.id, new Float64Array([xs.length])],
    ])

    const hessian = forwardOverReverse(backward, bindings, a.id, xs.length)
    let analytic = 0
    for (let i = 0; i < xs.length; i += 1) analytic += xs[i] * xs[i] * Math.exp(aValue * xs[i])
    analytic /= xs.length
    expect(hessian.get(a.id)!).toBeCloseTo(analytic, 10)
  })
})
