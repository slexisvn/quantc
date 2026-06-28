import { buildEuropeanGraph } from './european-graph'
import { compileCpuKernel, type CompiledCpuKernel } from '../backend/cpu/codegen'
import { standardNormals } from '../numerics/sampling'
import type { EuropeanGraph } from './european-graph'

export interface RepriceMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
}

export class CompiledEuropeanPricer {
  private readonly built: EuropeanGraph
  private readonly kernel: CompiledCpuKernel
  private readonly normals: Float64Array
  private readonly paths: number

  constructor(payoff: string, model: string, paths: number, seed: number) {
    this.built = buildEuropeanGraph(payoff, model)
    this.kernel = compileCpuKernel(this.built.graph)
    this.normals = standardNormals(paths, seed)
    this.paths = paths
  }

  reprice(market: RepriceMarket): number {
    const inputs = new Map<number, Float64Array>([
      [this.built.inputs.spot.id, new Float64Array([market.spot])],
      [this.built.inputs.strike.id, new Float64Array([market.strike])],
      [this.built.inputs.rate.id, new Float64Array([market.rate])],
      [this.built.inputs.vol.id, new Float64Array([market.vol])],
      [this.built.inputs.maturity.id, new Float64Array([market.maturity])],
      [this.built.inputs.normals.id, this.normals],
    ])
    return this.kernel.run(inputs, this.paths)
  }

  get source(): string {
    return this.kernel.source
  }
}
