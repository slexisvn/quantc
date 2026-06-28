export interface InflationSpec {
  readonly nominalRate: number
  readonly realRate: number
  readonly indexLevel: number
  readonly maturity: number
}

export function nominalBond(spec: InflationSpec): number {
  return Math.exp(-spec.nominalRate * spec.maturity)
}

export function realBond(spec: InflationSpec): number {
  return Math.exp(-spec.realRate * spec.maturity)
}

export function forwardIndex(spec: InflationSpec): number {
  return (spec.indexLevel * realBond(spec)) / nominalBond(spec)
}

export function breakevenInflation(spec: InflationSpec): number {
  return Math.pow(forwardIndex(spec) / spec.indexLevel, 1 / spec.maturity) - 1
}

export function inflationLinkedZeroCouponBond(spec: InflationSpec): number {
  return (nominalBond(spec) * forwardIndex(spec)) / spec.indexLevel
}
