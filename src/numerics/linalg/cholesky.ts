export function cholesky(matrix: number[][]): number[][] {
  const n = matrix.length
  const lower: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      let sum = 0
      for (let k = 0; k < j; k += 1) sum += lower[i][k] * lower[j][k]
      if (i === j) lower[i][j] = Math.sqrt(Math.max(matrix[i][i] - sum, 0))
      else lower[i][j] = lower[j][j] > 1e-14 ? (matrix[i][j] - sum) / lower[j][j] : 0
    }
  }
  return lower
}

export function correlate(factor: number[][], independent: number[]): number[] {
  const n = factor.length
  const result = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j <= i; j += 1) result[i] += factor[i][j] * independent[j]
  }
  return result
}
