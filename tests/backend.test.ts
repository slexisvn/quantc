import { describe, it, expect } from 'vitest'
import { buildEuropeanGraph } from '../src/engines/european-graph'
import { evaluate } from '../src/eval/interpreter'
import { compileFor } from '../src/backend/codegen-registry'
import { compileCudaKernel } from '../src/backend/cuda/codegen'
import { cpuTarget, cudaTarget } from '../src/backend/target'
import { autotune } from '../src/backend/schedule/autotuner'
import { standardNormals } from '../src/numerics/sampling'

function bindings(built: ReturnType<typeof buildEuropeanGraph>, paths: number, seed: number): Map<number, Float64Array> {
  return new Map<number, Float64Array>([
    [built.inputs.spot.id, new Float64Array([100])],
    [built.inputs.strike.id, new Float64Array([100])],
    [built.inputs.rate.id, new Float64Array([0.03])],
    [built.inputs.vol.id, new Float64Array([0.2])],
    [built.inputs.maturity.id, new Float64Array([1])],
    [built.inputs.normals.id, standardNormals(paths, seed)],
  ])
}

describe('backend codegen', () => {
  const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
  const paths = 50000
  const input = bindings(built, paths, 17)

  it('CPU-compiled kernel reproduces the interpreter exactly', () => {
    const compiled = compileFor(cpuTarget, built.graph)
    expect(compiled.run).toBeDefined()
    const interpreted = evaluate(built.graph, input, paths).get(built.price.id)![0]
    const kernelValue = compiled.run!(input, paths)
    expect(kernelValue).toBeCloseTo(interpreted, 10)
  })

  it('emits FP64 CUDA source for the same graph', () => {
    const cuda = compileCudaKernel(built.graph)
    expect(cuda.source).toContain('__global__')
    expect(cuda.source).toContain('double')
    expect(cuda.source).toContain('atomicAdd')
    expect(cuda.source).toContain('exp(')
    expect(cuda.source).not.toContain('float ')
  })

  it('routes through the codegen registry by target kind', () => {
    expect(compileFor(cpuTarget, built.graph).run).toBeDefined()
    expect(compileFor(cudaTarget, built.graph).source).toContain('__global__')
  })

  it('autotuner selects a candidate and the kernel agrees with the interpreter', () => {
    const compiled = compileFor(cpuTarget, built.graph)
    const interpreted = (): number => evaluate(built.graph, input, paths).get(built.price.id)![0]
    const kernel = (): number => compiled.run!(input, paths)
    const choice = autotune([{ name: 'interpreter', run: interpreted }, { name: 'kernel', run: kernel }], 3)
    expect(['interpreter', 'kernel']).toContain(choice.name)
    expect(kernel()).toBeCloseTo(interpreted(), 10)
  })
})
