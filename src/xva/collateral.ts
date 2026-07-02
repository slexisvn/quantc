export interface CollateralTerms {
  readonly threshold: number
  readonly minimumTransfer: number
  readonly independentAmount: number
  readonly mporSteps: number
}

export function collateralisedMtm(mtmPaths: readonly Float64Array[], times: readonly number[], csa: CollateralTerms): Float64Array[] {
  const steps = times.length
  const paths = mtmPaths.length > 0 ? mtmPaths[0].length : 0
  const result = times.map(() => new Float64Array(paths))
  for (let k = 0; k < steps; k += 1) {
    for (let p = 0; p < paths; p += 1) {
      const lagIndex = k - csa.mporSteps
      const lagged = lagIndex >= 0 ? mtmPaths[lagIndex][p] : 0
      const required = Math.max(lagged - csa.threshold, 0)
      const posted = required >= csa.minimumTransfer ? required : 0
      result[k][p] = mtmPaths[k][p] - posted - csa.independentAmount
    }
  }
  return result
}
