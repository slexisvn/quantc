export function combinations(n: number, k: number): number[][] {
  const result: number[][] = []
  const chosen: number[] = []
  const recurse = (start: number): void => {
    if (chosen.length === k) {
      result.push(chosen.slice())
      return
    }
    for (let i = start; i < n; i += 1) {
      chosen.push(i)
      recurse(i + 1)
      chosen.pop()
    }
  }
  recurse(0)
  return result
}
