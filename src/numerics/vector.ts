export function sumSquares(values: readonly number[]): number {
  let total = 0
  for (const value of values) total += value * value
  return total
}
