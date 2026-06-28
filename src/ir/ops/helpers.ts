import type { ValueKind } from '../types'

export function elementwiseKind(kinds: readonly ValueKind[]): ValueKind {
  for (const kind of kinds) {
    if (kind === 'batch') return 'batch'
  }
  return 'scalar'
}

export function at(array: Float64Array, index: number): number {
  return array.length === 1 ? array[0] : array[index]
}
