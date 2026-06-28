import type { Node } from './node'
import type { ValueKind } from './types'

export interface Use {
  readonly node: Node
  readonly index: number
}

export class Value {
  readonly id: number
  readonly kind: ValueKind
  readonly label: string
  producer: Node | null
  readonly uses: Use[]

  constructor(id: number, kind: ValueKind, label: string) {
    this.id = id
    this.kind = kind
    this.label = label
    this.producer = null
    this.uses = []
  }
}
