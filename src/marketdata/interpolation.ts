export function monotoneCubic(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length
  const delta = new Array<number>(n - 1)
  for (let i = 0; i < n - 1; i += 1) delta[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i])

  const slope = new Array<number>(n)
  slope[0] = delta[0]
  slope[n - 1] = delta[n - 2]
  for (let i = 1; i < n - 1; i += 1) slope[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2

  for (let i = 0; i < n - 1; i += 1) {
    if (delta[i] === 0) {
      slope[i] = 0
      slope[i + 1] = 0
      continue
    }
    const a = slope[i] / delta[i]
    const b = slope[i + 1] / delta[i]
    const magnitude = a * a + b * b
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude)
      slope[i] = scale * a * delta[i]
      slope[i + 1] = scale * b * delta[i]
    }
  }

  return (x: number): number => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (i < n - 1 && xs[i + 1] < x) i += 1
    const h = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    return h00 * ys[i] + h10 * h * slope[i] + h01 * ys[i + 1] + h11 * h * slope[i + 1]
  }
}
