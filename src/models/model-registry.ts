import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'

export interface ModelContext {
  readonly graph: Graph
  readonly spot: Value
  readonly rate: Value
  readonly vol: Value
  readonly maturity: Value
  readonly normals: Value
}

export interface MarketModel {
  readonly name: string
  terminal(context: ModelContext): Value
}

export class ModelRegistry {
  private readonly models = new Map<string, MarketModel>()

  register(model: MarketModel): void {
    if (this.models.has(model.name)) throw new Error(`duplicate model ${model.name}`)
    this.models.set(model.name, model)
  }

  get(name: string): MarketModel {
    const model = this.models.get(name)
    if (model === undefined) throw new Error(`unknown model ${name}`)
    return model
  }
}

export const models = new ModelRegistry()
