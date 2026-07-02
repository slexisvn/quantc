import { MersenneTwister } from './mersenne-twister'
import { Sobol, SOBOL_SCALE, sobolTrailingZeros } from './sobol'

function parity(value: number): number {
  let x = value >>> 0
  x ^= x >>> 16
  x ^= x >>> 8
  x ^= x >>> 4
  x ^= x >>> 2
  x ^= x >>> 1
  return x & 1
}

function lowerTriangularMatrix(generator: MersenneTwister): Uint32Array {
  const rows = new Uint32Array(32)
  for (let i = 0; i < 32; i += 1) {
    let mask = (1 << (31 - i)) >>> 0
    for (let j = 0; j < i; j += 1) {
      if (generator.nextDouble() < 0.5) mask = (mask | ((1 << (31 - j)) >>> 0)) >>> 0
    }
    rows[i] = mask >>> 0
  }
  return rows
}

function applyMatrix(rows: Uint32Array, value: number): number {
  let result = 0
  for (let i = 0; i < 32; i += 1) {
    if (parity(rows[i] & value) === 1) result = (result | ((1 << (31 - i)) >>> 0)) >>> 0
  }
  return result >>> 0
}

function randomUint32(generator: MersenneTwister): number {
  return Math.floor(generator.nextDouble() * 4294967296) >>> 0
}

export class ScrambledSobol {
  private readonly dimension: number
  private readonly scrambledDirections: Uint32Array[]
  private readonly shift: Uint32Array
  private readonly state: Uint32Array
  private count = 0

  constructor(dimension: number, seed: number) {
    const base = new Sobol(dimension)
    const directions = base.directionNumbers()
    const generator = new MersenneTwister(seed)
    this.dimension = dimension
    this.scrambledDirections = directions.map((direction) => {
      const matrix = lowerTriangularMatrix(generator)
      const scrambled = new Uint32Array(direction.length)
      for (let i = 0; i < direction.length; i += 1) scrambled[i] = applyMatrix(matrix, direction[i])
      return scrambled
    })
    this.shift = new Uint32Array(dimension)
    for (let d = 0; d < dimension; d += 1) this.shift[d] = randomUint32(generator)
    this.state = new Uint32Array(dimension)
  }

  next(): Float64Array {
    this.count += 1
    const column = sobolTrailingZeros(this.count) + 1
    const point = new Float64Array(this.dimension)
    for (let d = 0; d < this.dimension; d += 1) {
      this.state[d] = (this.state[d] ^ this.scrambledDirections[d][column]) >>> 0
      point[d] = ((this.state[d] ^ this.shift[d]) >>> 0) * SOBOL_SCALE
    }
    return point
  }
}
