import { describe, it, expect } from 'vitest'
import { buildEuropeanGraph } from '../src/engines/european-graph'
import { compileCudaKernel } from '../src/backend/cuda/codegen'
import { evaluate } from '../src/eval/interpreter'
import { cudaAvailable, launchReductionKernel, deviceArchitecture } from '../src/runtime/cuda/driver'
import { compileFor } from '../src/backend/codegen-registry'
import { cudaTarget } from '../src/backend/target'
import { standardNormals } from '../src/numerics/sampling'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

const available = cudaAvailable()
const maybe = available ? it : it.skip

describe('CUDA FP64 execution (NVRTC + driver API)', () => {
  it('reports whether a CUDA device is available', () => {
    console.log('CUDA available:', available)
    expect(typeof available).toBe('boolean')
  })

  maybe('runs the compiled kernel on the GPU and matches the interpreter and Black-Scholes', () => {
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const kernel = compileCudaKernel(built.graph)
    const paths = 200000
    const normals = standardNormals(paths, 4242)

    const scalarValues = new Map<number, number>([
      [built.inputs.spot.id, 100],
      [built.inputs.strike.id, 100],
      [built.inputs.rate.id, 0.03],
      [built.inputs.vol.id, 0.2],
      [built.inputs.maturity.id, 1],
    ])
    const batchData = new Map<number, Float64Array>([[built.inputs.normals.id, normals]])

    const gpuPrice = launchReductionKernel(kernel, scalarValues, batchData, paths)

    const interpreterInputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, normals],
    ])
    const cpuPrice = evaluate(built.graph, interpreterInputs, paths).get(built.price.id)![0]
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true }).price

    console.log('arch', deviceArchitecture(), 'GPU price', gpuPrice, 'CPU price', cpuPrice, 'BS price', reference)
    expect(gpuPrice).toBeCloseTo(cpuPrice, 5)
    expect(Math.abs(gpuPrice - reference)).toBeLessThan(0.1)
  })

  maybe('computes price + Greeks via GPU AAD (adjoint reductions on the GPU)', async () => {
    const { buildBackwardGraph } = await import('../src/aad/backward-graph')
    const { gpuAadGreeks } = await import('../src/backend/cuda/aad')
    const { reverse } = await import('../src/aad/reverse')

    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const paths = 100000
    const normals = standardNormals(paths, 909)
    const riskFactors = [built.inputs.spot, built.inputs.vol, built.inputs.rate]
    const backward = buildBackwardGraph(built.graph, built.price, riskFactors)

    const scalarValues = new Map<number, number>([
      [built.inputs.spot.id, 100],
      [built.inputs.strike.id, 100],
      [built.inputs.rate.id, 0.03],
      [built.inputs.vol.id, 0.2],
      [built.inputs.maturity.id, 1],
      [backward.batchSize.id, paths],
    ])
    const batchData = new Map<number, Float64Array>([[built.inputs.normals.id, normals]])
    const outputs = [built.price, backward.gradients.get(built.inputs.spot.id)!, backward.gradients.get(built.inputs.vol.id)!]
    const gpu = gpuAadGreeks(backward, scalarValues, batchData, paths, outputs)

    const cpuInputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, normals],
      [backward.batchSize.id, new Float64Array([paths])],
    ])
    const forward = evaluate(built.graph, cpuInputs, paths)
    const cpuGrads = reverse(built.graph, forward, new Map([[built.price.id, new Float64Array([1])]]))

    console.log('GPU AAD price/delta/vega', gpu[0], gpu[1], gpu[2])
    expect(gpu[0]).toBeCloseTo(forward.get(built.price.id)![0], 5)
    expect(gpu[1]).toBeCloseTo(cpuGrads.get(built.inputs.spot.id)![0], 5)
    expect(gpu[2]).toBeCloseTo(cpuGrads.get(built.inputs.vol.id)![0], 5)
  })

  maybe('executes through the codegen registry on the GPU', () => {
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const paths = 100000
    const inputs = new Map<number, Float64Array>([
      [built.inputs.spot.id, new Float64Array([100])],
      [built.inputs.strike.id, new Float64Array([100])],
      [built.inputs.rate.id, new Float64Array([0.03])],
      [built.inputs.vol.id, new Float64Array([0.2])],
      [built.inputs.maturity.id, new Float64Array([1])],
      [built.inputs.normals.id, standardNormals(paths, 555)],
    ])
    const artifact = compileFor(cudaTarget, built.graph)
    expect(artifact.run).toBeDefined()
    const gpuPrice = artifact.run!(inputs, paths)
    const cpuPrice = evaluate(built.graph, inputs, paths).get(built.price.id)![0]
    expect(gpuPrice).toBeCloseTo(cpuPrice, 5)
  })
})
