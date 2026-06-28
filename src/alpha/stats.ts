export interface Moments {
  readonly mean: number
  readonly variance: number
  readonly skew: number
  readonly kurt: number
}

export function moments(xs: number[]): Moments {
  const n = xs.length
  if (n === 0) return { mean: 0, variance: 0, skew: 0, kurt: 3 }
  let mean = 0
  for (const x of xs) mean += x
  mean /= n
  let m2 = 0
  let m3 = 0
  let m4 = 0
  for (const x of xs) {
    const d = x - mean
    const d2 = d * d
    m2 += d2
    m3 += d2 * d
    m4 += d2 * d2
  }
  m2 /= n
  m3 /= n
  m4 /= n
  const std = Math.sqrt(m2)
  const skew = std < 1e-12 ? 0 : m3 / (std * std * std)
  const kurt = m2 < 1e-24 ? 3 : m4 / (m2 * m2)
  return { mean, variance: m2, skew, kurt }
}

export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0
  let ma = 0
  let mb = 0
  for (let i = 0; i < n; i += 1) {
    ma += a[i]
    mb += b[i]
  }
  ma /= n
  mb /= n
  let cov = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i += 1) {
    const da = a[i] - ma
    const db = b[i] - mb
    cov += da * db
    va += da * da
    vb += db * db
  }
  return va < 1e-24 || vb < 1e-24 ? 0 : cov / Math.sqrt(va * vb)
}

export function ranks(xs: number[]): number[] {
  const order = xs.map((x, i) => [x, i] as [number, number]).sort((p, q) => p[0] - q[0])
  const result = new Array<number>(xs.length).fill(0)
  let i = 0
  while (i < order.length) {
    let j = i
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j += 1
    const average = (i + j) / 2
    for (let k = i; k <= j; k += 1) result[order[k][1]] = average
    i = j + 1
  }
  return result
}

export function spearman(a: number[], b: number[]): number {
  return pearson(ranks(a), ranks(b))
}

export function percentile(xs: number[], quantile: number): number {
  if (xs.length === 0) return 0
  const sorted = [...xs].sort((p, q) => p - q)
  const position = quantile * (sorted.length - 1)
  const lower = Math.floor(position)
  const upper = Math.min(sorted.length - 1, lower + 1)
  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}
