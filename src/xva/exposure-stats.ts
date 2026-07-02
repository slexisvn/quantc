export interface ExposureStatsOptions {
  readonly quantile: number
  readonly collateralThreshold?: number
}

export interface ExposureProfileStats {
  readonly epe: number[]
  readonly ene: number[]
  readonly pfe: number[]
  readonly collateralEpe: number[]
  readonly eepe: number
}

export function exposureQuantile(values: Float64Array, quantile: number): number {
  const sorted = Float64Array.from(values).sort()
  const index = Math.min(sorted.length - 1, Math.floor(quantile * sorted.length))
  return sorted[index]
}

export function exposureStatistics(times: readonly number[], mtmPaths: readonly Float64Array[], options: ExposureStatsOptions): ExposureProfileStats {
  const steps = times.length
  const paths = mtmPaths.length > 0 ? mtmPaths[0].length : 0
  const threshold = options.collateralThreshold ?? 0
  const epe: number[] = []
  const ene: number[] = []
  const pfe: number[] = []
  const collateralEpe: number[] = []

  for (let k = 0; k < steps; k += 1) {
    const positive = new Float64Array(paths)
    let sumPositive = 0
    let sumNegative = 0
    let sumCollateral = 0
    for (let p = 0; p < paths; p += 1) {
      const value = mtmPaths[k][p]
      const exposure = Math.max(value, 0)
      positive[p] = exposure
      sumPositive += exposure
      sumNegative += Math.min(value, 0)
      const collateral = k > 0 ? Math.max(mtmPaths[k - 1][p] - threshold, 0) : 0
      sumCollateral += Math.max(value - collateral, 0)
    }
    epe.push(sumPositive / paths)
    ene.push(sumNegative / paths)
    pfe.push(exposureQuantile(positive, options.quantile))
    collateralEpe.push(sumCollateral / paths)
  }

  let runningMax = 0
  let integral = 0
  let previousTime = 0
  for (let k = 0; k < steps; k += 1) {
    runningMax = Math.max(runningMax, epe[k])
    integral += runningMax * (times[k] - previousTime)
    previousTime = times[k]
  }
  const eepe = integral / times[steps - 1]

  return { epe, ene, pfe, collateralEpe, eepe }
}
