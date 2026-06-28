const N = 624
const M = 397
const MATRIX_A = 0x9908b0df
const UPPER_MASK = 0x80000000
const LOWER_MASK = 0x7fffffff
const TWO_POW_53 = 9007199254740992.0
const TWO_POW_26 = 67108864.0

export class MersenneTwister {
  private readonly state = new Uint32Array(N)
  private index = N + 1

  constructor(seed: number) {
    this.seed(seed >>> 0)
  }

  private seed(value: number): void {
    this.state[0] = value >>> 0
    for (let i = 1; i < N; i += 1) {
      const previous = this.state[i - 1] ^ (this.state[i - 1] >>> 30)
      this.state[i] = (Math.imul(1812433253, previous) + i) >>> 0
    }
    this.index = N
  }

  private nextUint32(): number {
    if (this.index >= N) {
      let y: number
      let kk = 0
      for (; kk < N - M; kk += 1) {
        y = (this.state[kk] & UPPER_MASK) | (this.state[kk + 1] & LOWER_MASK)
        this.state[kk] = (this.state[kk + M] ^ (y >>> 1) ^ ((y & 1) !== 0 ? MATRIX_A : 0)) >>> 0
      }
      for (; kk < N - 1; kk += 1) {
        y = (this.state[kk] & UPPER_MASK) | (this.state[kk + 1] & LOWER_MASK)
        this.state[kk] = (this.state[kk + (M - N)] ^ (y >>> 1) ^ ((y & 1) !== 0 ? MATRIX_A : 0)) >>> 0
      }
      y = (this.state[N - 1] & UPPER_MASK) | (this.state[0] & LOWER_MASK)
      this.state[N - 1] = (this.state[M - 1] ^ (y >>> 1) ^ ((y & 1) !== 0 ? MATRIX_A : 0)) >>> 0
      this.index = 0
    }

    let x = this.state[this.index]
    this.index += 1
    x ^= x >>> 11
    x ^= (x << 7) & 0x9d2c5680
    x ^= (x << 15) & 0xefc60000
    x ^= x >>> 18
    return x >>> 0
  }

  nextDouble(): number {
    const high = this.nextUint32() >>> 5
    const low = this.nextUint32() >>> 6
    return (high * TWO_POW_26 + low) / TWO_POW_53
  }
}
