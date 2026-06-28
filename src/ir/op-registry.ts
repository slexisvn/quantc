import type { Attr, ValueKind } from './types'

export interface OpDef {
  readonly name: string
  readonly arity: number
  readonly inferKind: (operandKinds: readonly ValueKind[], attrs: Attr) => ValueKind
  readonly evalFn: (operands: readonly Float64Array[], outLen: number, attrs: Attr) => Float64Array
  readonly adjointFn: (operands: readonly Float64Array[], result: Float64Array, adjOut: Float64Array, attrs: Attr) => Float64Array[]
  readonly jvpFn: (operands: readonly Float64Array[], tangents: readonly Float64Array[], result: Float64Array, outLen: number, attrs: Attr) => Float64Array
}

export class OpRegistry {
  private readonly definitions = new Map<string, OpDef>()

  register(definition: OpDef): void {
    if (this.definitions.has(definition.name)) throw new Error(`duplicate op ${definition.name}`)
    this.definitions.set(definition.name, definition)
  }

  get(name: string): OpDef {
    const definition = this.definitions.get(name)
    if (definition === undefined) throw new Error(`unknown op ${name}`)
    return definition
  }

  has(name: string): boolean {
    return this.definitions.has(name)
  }
}

export const registry = new OpRegistry()
