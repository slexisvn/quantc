export interface Candidate {
  readonly name: string
  readonly run: () => number
}

export interface AutotuneResult {
  readonly name: string
  readonly value: number
  readonly milliseconds: number
  readonly timings: ReadonlyArray<{ name: string; milliseconds: number }>
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? 0.5 * (sorted[middle - 1] + sorted[middle]) : sorted[middle]
}

export function autotune(candidates: readonly Candidate[], repeats: number): AutotuneResult {
  let best: AutotuneResult | null = null
  const timings: { name: string; milliseconds: number }[] = []

  for (const candidate of candidates) {
    const samples: number[] = []
    let lastValue = 0
    for (let r = 0; r < repeats; r += 1) {
      const start = performance.now()
      lastValue = candidate.run()
      samples.push(performance.now() - start)
    }
    const milliseconds = median(samples)
    timings.push({ name: candidate.name, milliseconds })
    if (best === null || milliseconds < best.milliseconds) {
      best = { name: candidate.name, value: lastValue, milliseconds, timings }
    }
  }

  if (best === null) throw new Error('no autotune candidates')
  return { ...best, timings }
}
