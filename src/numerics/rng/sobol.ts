import directionTable from '../../../data/sobol/joe-kuo.json'

interface DirectionEntry {
  readonly d: number
  readonly s: number
  readonly a: number
  readonly m: number[]
}

interface DirectionTable {
  readonly bits: number
  readonly dimensions: DirectionEntry[]
}

const TABLE = directionTable as DirectionTable
const SCALE = 1 / 2 ** 32

function trailingZeros(value: number): number {
  let count = 0
  let n = value
  while ((n & 1) === 0) {
    count += 1
    n >>>= 1
  }
  return count
}

function buildDirection(entry: DirectionEntry | null, bits: number): Uint32Array {
  const v = new Uint32Array(bits + 1)
  if (entry === null) {
    for (let i = 1; i <= bits; i += 1) v[i] = (1 << (32 - i)) >>> 0
    return v
  }
  const { s, a, m } = entry
  for (let i = 1; i <= s; i += 1) v[i] = (m[i - 1] << (32 - i)) >>> 0
  for (let i = s + 1; i <= bits; i += 1) {
    let value = v[i - s] ^ (v[i - s] >>> s)
    for (let k = 1; k <= s - 1; k += 1) value ^= ((a >>> (s - 1 - k)) & 1) * v[i - k]
    v[i] = value >>> 0
  }
  return v
}

export class Sobol {
  private readonly dimension: number
  private readonly directions: Uint32Array[]
  private readonly state: Uint32Array
  private count = 0

  constructor(dimension: number) {
    if (dimension > TABLE.dimensions.length + 1) throw new Error(`Sobol dimension ${dimension} exceeds available direction numbers`)
    this.dimension = dimension
    this.directions = []
    for (let d = 0; d < dimension; d += 1) {
      const entry = d === 0 ? null : TABLE.dimensions[d - 1]
      this.directions.push(buildDirection(entry, TABLE.bits))
    }
    this.state = new Uint32Array(dimension)
  }

  next(): Float64Array {
    this.count += 1
    const column = trailingZeros(this.count) + 1
    const point = new Float64Array(this.dimension)
    for (let d = 0; d < this.dimension; d += 1) {
      this.state[d] = (this.state[d] ^ this.directions[d][column]) >>> 0
      point[d] = this.state[d] * SCALE
    }
    return point
  }

  directionNumbers(): readonly Uint32Array[] {
    return this.directions
  }

  get bits(): number {
    return TABLE.bits
  }
}

export const SOBOL_SCALE = SCALE

export function sobolTrailingZeros(value: number): number {
  return trailingZeros(value)
}
