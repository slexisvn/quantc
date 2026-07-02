import type { FrtbParameters } from './frtb-parameters'

export interface RraoPosition {
  readonly notional: number
  readonly kind: string
}

export function rraoCharge(positions: readonly RraoPosition[], params: FrtbParameters): number {
  let charge = 0
  for (const position of positions) {
    const rate = params.rraoRates.get(position.kind)
    if (rate === undefined) throw new Error(`unknown RRAO kind ${position.kind}`)
    charge += rate * Math.abs(position.notional)
  }
  return charge
}
