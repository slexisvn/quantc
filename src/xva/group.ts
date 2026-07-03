export function groupBy<T, K>(items: Iterable<T>, key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const existing = groups.get(k)
    if (existing !== undefined) existing.push(item)
    else groups.set(k, [item])
  }
  return groups
}
