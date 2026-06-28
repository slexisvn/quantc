export function solveTridiagonal(lower: Float64Array, diag: Float64Array, upper: Float64Array, rhs: Float64Array): Float64Array {
  const n = diag.length
  const cPrime = new Float64Array(n)
  const dPrime = new Float64Array(n)
  const solution = new Float64Array(n)

  cPrime[0] = upper[0] / diag[0]
  dPrime[0] = rhs[0] / diag[0]
  for (let i = 1; i < n; i += 1) {
    const denominator = diag[i] - lower[i] * cPrime[i - 1]
    cPrime[i] = upper[i] / denominator
    dPrime[i] = (rhs[i] - lower[i] * dPrime[i - 1]) / denominator
  }

  solution[n - 1] = dPrime[n - 1]
  for (let i = n - 2; i >= 0; i -= 1) solution[i] = dPrime[i] - cPrime[i] * solution[i + 1]
  return solution
}
