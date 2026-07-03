export function requireValue(values: Map<number, Float64Array>, id: number): Float64Array {
  const value = values.get(id)
  if (value === undefined) throw new Error(`missing value ${id}`)
  return value
}
