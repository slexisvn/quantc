export type CorrelationFn = (i: number, j: number) => number

export function quadraticAggregate(weighted: readonly number[], correlation: CorrelationFn): number {
  let total = 0
  const n = weighted.length
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      total += correlation(i, j) * weighted[i] * weighted[j]
    }
  }
  return Math.sqrt(Math.max(total, 0))
}

export function constantCorrelation(rho: number): CorrelationFn {
  return (i, j) => (i === j ? 1 : rho)
}

export interface AggregationCell {
  readonly margin: number
  readonly residual: number
}

export function nestedAggregate(cells: readonly AggregationCell[], correlation: CorrelationFn): AggregationCell {
  let total = 0
  let sumResidual = 0
  const n = cells.length
  for (let i = 0; i < n; i += 1) {
    sumResidual += cells[i].residual
    for (let j = 0; j < n; j += 1) {
      total += (i === j ? cells[i].margin * cells[i].margin : correlation(i, j) * cells[i].residual * cells[j].residual)
    }
  }
  const margin = Math.sqrt(Math.max(total, 0))
  const residual = Math.min(Math.max(sumResidual, -margin), margin)
  return { margin, residual }
}
