function addArrays(a: Float64Array, b: Float64Array): Float64Array {
  const n = a.length >= b.length ? a.length : b.length
  const out = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    out[i] = (a.length === 1 ? a[0] : a[i]) + (b.length === 1 ? b[0] : b[i])
  }
  return out
}

function treeReduce(parts: Float64Array[]): Float64Array {
  let level = parts
  while (level.length > 1) {
    const next: Float64Array[] = []
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) next.push(addArrays(level[i], level[i + 1]))
      else next.push(level[i])
    }
    level = next
  }
  return level[0]
}

export class GradAccumulator {
  private readonly pending = new Map<number, Float64Array[]>()

  add(id: number, grad: Float64Array): void {
    const existing = this.pending.get(id)
    if (existing !== undefined) existing.push(grad)
    else this.pending.set(id, [grad])
  }

  get(id: number): Float64Array | null {
    const parts = this.pending.get(id)
    if (parts === undefined || parts.length === 0) return null
    return treeReduce(parts)
  }
}
