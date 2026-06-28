import { describe, it, expect } from 'vitest'
import { registerBuiltinOps } from '../../src/ir/ops/index'
import { evaluate } from '../../src/eval/interpreter'
import { reverse } from '../../src/aad/reverse'
import { buildBackwardGraph } from '../../src/aad/backward-graph'
import { compileCpuMultiKernel } from '../../src/backend/cpu/codegen'
import { buildEuropeanGraph } from '../../src/engines/european-graph'
import { standardNormals } from '../../src/numerics/sampling'

registerBuiltinOps()

describe('compiled AAD kernel (price + all Greeks in one fused pass)', () => {
  it('CPU multi-output kernel matches interpreter price and numeric-reverse Greeks', () => {
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const paths = 50000
    const normals = standardNormals(paths, 21)
    const inputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, normals],
    ])

    const forward = evaluate(built.graph, inputs, paths)
    const price = forward.get(built.price.id)![0]
    const grads = reverse(built.graph, forward, new Map([[built.price.id, new Float64Array([1])]]))

    const riskFactors = [built.inputs.spot, built.inputs.vol, built.inputs.rate, built.inputs.maturity]
    const backward = buildBackwardGraph(built.graph, built.price, riskFactors)
    const outputs = [built.price, ...riskFactors.map((factor) => backward.gradients.get(factor.id)!)]
    const kernel = compileCpuMultiKernel(backward.graph, outputs)

    const kernelInputs = new Map(inputs)
    kernelInputs.set(backward.batchSize.id, new Float64Array([paths]))
    const result = kernel.run(kernelInputs, paths)

    expect(result[0]).toBeCloseTo(price, 9)
    expect(result[1]).toBeCloseTo(grads.get(built.inputs.spot.id)![0], 9)
    expect(result[2]).toBeCloseTo(grads.get(built.inputs.vol.id)![0], 9)
    expect(result[3]).toBeCloseTo(grads.get(built.inputs.rate.id)![0], 9)
  })
})
