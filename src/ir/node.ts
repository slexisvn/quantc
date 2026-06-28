import type { Value } from './value'
import type { Attr } from './types'

export class Node {
  readonly id: number
  readonly op: string
  readonly operands: Value[]
  readonly result: Value
  readonly attrs: Attr

  constructor(id: number, op: string, operands: Value[], result: Value, attrs: Attr) {
    this.id = id
    this.op = op
    this.operands = operands
    this.result = result
    this.attrs = attrs
  }
}
