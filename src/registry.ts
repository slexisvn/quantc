export interface Registry<T> {
  register(name: string, value: T): void
  get(name: string): T
  has(name: string): boolean
}

export function createRegistry<T>(label: string, initial?: Iterable<readonly [string, T]>): Registry<T> {
  const entries = new Map<string, T>(initial)
  return {
    register(name, value) {
      if (entries.has(name)) throw new Error(`duplicate ${label} ${name}`)
      entries.set(name, value)
    },
    get(name) {
      const value = entries.get(name)
      if (value === undefined) throw new Error(`unknown ${label} ${name}`)
      return value
    },
    has(name) {
      return entries.has(name)
    },
  }
}
