export interface MvaSpec {
  readonly fundingSpread: number
  readonly discount: (t: number) => number
}

export function computeMva(expectedIm: readonly number[], times: readonly number[], spec: MvaSpec): number {
  if (times.length === 0) return 0
  let mva = 0
  let previousTime = 0
  let previousValue = spec.fundingSpread * expectedIm[0] * spec.discount(0)
  for (let k = 0; k < times.length; k += 1) {
    const value = spec.fundingSpread * expectedIm[k] * spec.discount(times[k])
    const dt = times[k] - previousTime
    mva += 0.5 * (previousValue + value) * dt
    previousTime = times[k]
    previousValue = value
  }
  return mva
}
