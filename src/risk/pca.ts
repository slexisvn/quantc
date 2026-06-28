export interface Eigensystem {
  readonly values: number[]
  readonly vectors: number[][]
}

export function jacobiEigen(symmetric: number[][], maxSweeps = 100, tolerance = 1e-14): Eigensystem {
  const n = symmetric.length
  const a = symmetric.map((row) => [...row])
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))

  for (let sweep = 0; sweep < maxSweeps; sweep += 1) {
    let offDiagonal = 0
    for (let p = 0; p < n; p += 1) {
      for (let q = p + 1; q < n; q += 1) offDiagonal += a[p][q] * a[p][q]
    }
    if (offDiagonal < tolerance) break

    for (let p = 0; p < n; p += 1) {
      for (let q = p + 1; q < n; q += 1) {
        if (Math.abs(a[p][q]) < 1e-300) continue
        const phi = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p])
        const cos = Math.cos(phi)
        const sin = Math.sin(phi)
        for (let k = 0; k < n; k += 1) {
          const akp = a[k][p]
          const akq = a[k][q]
          a[k][p] = cos * akp - sin * akq
          a[k][q] = sin * akp + cos * akq
        }
        for (let k = 0; k < n; k += 1) {
          const apk = a[p][k]
          const aqk = a[q][k]
          a[p][k] = cos * apk - sin * aqk
          a[q][k] = sin * apk + cos * aqk
        }
        for (let k = 0; k < n; k += 1) {
          const vkp = v[k][p]
          const vkq = v[k][q]
          v[k][p] = cos * vkp - sin * vkq
          v[k][q] = sin * vkp + cos * vkq
        }
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[j][j] - a[i][i])
  return {
    values: order.map((i) => a[i][i]),
    vectors: order.map((i) => v.map((row) => row[i])),
  }
}

export function reconstructCovariance(system: Eigensystem): number[][] {
  const n = system.values.length
  const result: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      let sum = 0
      for (let k = 0; k < n; k += 1) sum += system.values[k] * system.vectors[k][i] * system.vectors[k][j]
      result[i][j] = sum
    }
  }
  return result
}
