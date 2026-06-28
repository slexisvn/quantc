export function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length
  const a = matrix.map((row, i) => [...row, rhs[i]])

  for (let column = 0; column < n; column += 1) {
    let pivot = column
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row
    }
    const temp = a[column]
    a[column] = a[pivot]
    a[pivot] = temp

    const diagonal = a[column][column]
    if (Math.abs(diagonal) < 1e-14) continue
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue
      const factor = a[row][column] / diagonal
      for (let k = column; k <= n; k += 1) a[row][k] -= factor * a[column][k]
    }
  }

  const solution = new Array<number>(n)
  for (let i = 0; i < n; i += 1) {
    const diagonal = a[i][i]
    solution[i] = Math.abs(diagonal) < 1e-14 ? 0 : a[i][n] / diagonal
  }
  return solution
}
