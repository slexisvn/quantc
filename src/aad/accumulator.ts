export class Accumulator<T> {
  private readonly pending = new Map<number, T[]>()

  constructor(private readonly merge: (a: T, b: T) => T) {}

  add(id: number, value: T): void {
    const existing = this.pending.get(id)
    if (existing !== undefined) existing.push(value)
    else this.pending.set(id, [value])
  }

  get(id: number): T | null {
    let level = this.pending.get(id)
    if (level === undefined || level.length === 0) return null
    while (level.length > 1) {
      const next: T[] = []
      for (let i = 0; i < level.length; i += 2) next.push(i + 1 < level.length ? this.merge(level[i], level[i + 1]) : level[i])
      level = next
    }
    return level[0]
  }
}
