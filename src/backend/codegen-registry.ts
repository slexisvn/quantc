import type { Graph } from '../ir/graph'
import type { Target } from './target'
import { compileCpuKernel } from './cpu/codegen'
import { compileCudaKernel } from './cuda/codegen'
import { launchReductionKernel } from '../runtime/cuda/driver'

export interface CompiledArtifact {
  readonly source: string
  readonly run?: (inputs: Map<number, Float64Array>, batchSize: number) => number
}

export type CodegenFn = (graph: Graph) => CompiledArtifact

export class CodegenRegistry {
  private readonly backends = new Map<string, CodegenFn>()

  register(kind: string, codegen: CodegenFn): void {
    if (this.backends.has(kind)) throw new Error(`duplicate codegen ${kind}`)
    this.backends.set(kind, codegen)
  }

  get(kind: string): CodegenFn {
    const codegen = this.backends.get(kind)
    if (codegen === undefined) throw new Error(`no codegen for ${kind}`)
    return codegen
  }
}

export const codegenRegistry = new CodegenRegistry()

let registered = false

export function registerBuiltinBackends(): void {
  if (registered) return
  codegenRegistry.register('cpu', (graph) => {
    const kernel = compileCpuKernel(graph)
    return { source: kernel.source, run: kernel.run }
  })
  codegenRegistry.register('cuda', (graph) => {
    const kernel = compileCudaKernel(graph)
    return {
      source: kernel.source,
      run: (inputs, batchSize) => {
        const scalarValues = new Map<number, number>()
        for (const id of kernel.scalarInputs) {
          const value = inputs.get(id)
          if (value === undefined) throw new Error(`missing scalar input ${id}`)
          scalarValues.set(id, value[0])
        }
        const batchData = new Map<number, Float64Array>()
        for (const id of kernel.batchInputs) {
          const value = inputs.get(id)
          if (value === undefined) throw new Error(`missing batch input ${id}`)
          batchData.set(id, value)
        }
        return launchReductionKernel(kernel, scalarValues, batchData, batchSize)
      },
    }
  })
  registered = true
}

export function compileFor(target: Target, graph: Graph): CompiledArtifact {
  registerBuiltinBackends()
  return codegenRegistry.get(target.kind)(graph)
}
