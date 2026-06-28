export type DType = 'f64'

export type ValueKind = 'scalar' | 'batch'

export type AttrValue = number | string | boolean

export interface Attr {
  readonly [key: string]: AttrValue
}
