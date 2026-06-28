export class Welford {
  private n = 0
  private runningMean = 0
  private m2 = 0

  push(x: number): void {
    this.n += 1
    const delta = x - this.runningMean
    this.runningMean += delta / this.n
    this.m2 += delta * (x - this.runningMean)
  }

  get count(): number {
    return this.n
  }

  get mean(): number {
    return this.runningMean
  }

  get variance(): number {
    return this.n > 1 ? this.m2 / (this.n - 1) : 0
  }

  get standardError(): number {
    return this.n > 0 ? Math.sqrt(this.variance / this.n) : 0
  }

  get sumSquaredDeviations(): number {
    return this.m2
  }
}

export interface MomentState {
  readonly count: number
  readonly mean: number
  readonly sumSquaredDeviations: number
}

export function combineMoments(states: readonly MomentState[]): MomentState {
  let count = 0
  let mean = 0
  let m2 = 0
  for (const state of states) {
    if (state.count === 0) continue
    const delta = state.mean - mean
    const combined = count + state.count
    mean += (delta * state.count) / combined
    m2 += state.sumSquaredDeviations + (delta * delta * count * state.count) / combined
    count = combined
  }
  return { count, mean, sumSquaredDeviations: m2 }
}

export function standardErrorOf(state: MomentState): number {
  if (state.count < 2) return 0
  return Math.sqrt(state.sumSquaredDeviations / (state.count - 1) / state.count)
}
