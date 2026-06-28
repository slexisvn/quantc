export interface PsorOptions {
  readonly relaxation: number
  readonly maxIterations: number
  readonly tolerance: number
}

const DEFAULT_OPTIONS: PsorOptions = { relaxation: 1.4, maxIterations: 10000, tolerance: 1e-12 }

export function projectedSor(lower: Float64Array, diag: Float64Array, upper: Float64Array, rhs: Float64Array, floor: Float64Array, options: Partial<PsorOptions> = {}): Float64Array {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const n = diag.length
  const solution = new Float64Array(n)
  for (let i = 0; i < n; i += 1) solution[i] = Math.max(rhs[i] / diag[i], floor[i])

  for (let iteration = 0; iteration < config.maxIterations; iteration += 1) {
    let error = 0
    for (let i = 0; i < n; i += 1) {
      const left = i > 0 ? lower[i] * solution[i - 1] : 0
      const right = i < n - 1 ? upper[i] * solution[i + 1] : 0
      const gaussSeidel = (rhs[i] - left - right) / diag[i]
      const relaxed = solution[i] + config.relaxation * (gaussSeidel - solution[i])
      const projected = Math.max(relaxed, floor[i])
      error += (projected - solution[i]) * (projected - solution[i])
      solution[i] = projected
    }
    if (error < config.tolerance) break
  }
  return solution
}
