import { totalVariance, dTotalVariance, d2TotalVariance, type SviParams } from './svi'

export interface SurfaceSlice {
  readonly maturity: number
  readonly params: SviParams
}

function bracket(slices: readonly SurfaceSlice[], maturity: number): { lower: number; upper: number; weight: number } {
  if (maturity <= slices[0].maturity) return { lower: 0, upper: 0, weight: 0 }
  if (maturity >= slices[slices.length - 1].maturity) return { lower: slices.length - 1, upper: slices.length - 1, weight: 0 }
  let i = 0
  while (i < slices.length - 1 && slices[i + 1].maturity <= maturity) i += 1
  const weight = (maturity - slices[i].maturity) / (slices[i + 1].maturity - slices[i].maturity)
  return { lower: i, upper: i + 1, weight }
}

export class VolSurface {
  private readonly slices: SurfaceSlice[]

  constructor(slices: SurfaceSlice[]) {
    this.slices = [...slices].sort((a, b) => a.maturity - b.maturity)
  }

  private interpolate(read: (params: SviParams, k: number) => number, k: number, maturity: number): number {
    const { lower, upper, weight } = bracket(this.slices, maturity)
    const low = read(this.slices[lower].params, k)
    if (lower === upper) return low
    const high = read(this.slices[upper].params, k)
    return low + weight * (high - low)
  }

  totalVariance(k: number, maturity: number): number {
    return this.interpolate(totalVariance, k, maturity)
  }

  dTotalVarianceDk(k: number, maturity: number): number {
    return this.interpolate(dTotalVariance, k, maturity)
  }

  d2TotalVarianceDk(k: number, maturity: number): number {
    return this.interpolate(d2TotalVariance, k, maturity)
  }

  dTotalVarianceDt(k: number, maturity: number): number {
    const { lower, upper } = bracket(this.slices, maturity)
    if (lower === upper) {
      const index = lower === 0 ? 0 : lower - 1
      const next = index + 1 < this.slices.length ? index + 1 : index
      if (next === index) return totalVariance(this.slices[index].params, k) / this.slices[index].maturity
      return (totalVariance(this.slices[next].params, k) - totalVariance(this.slices[index].params, k)) / (this.slices[next].maturity - this.slices[index].maturity)
    }
    return (totalVariance(this.slices[upper].params, k) - totalVariance(this.slices[lower].params, k)) / (this.slices[upper].maturity - this.slices[lower].maturity)
  }

  impliedVol(strike: number, forward: number, maturity: number): number {
    const k = Math.log(strike / forward)
    return Math.sqrt(this.totalVariance(k, maturity) / maturity)
  }
}
