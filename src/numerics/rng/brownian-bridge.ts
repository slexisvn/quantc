export class BrownianBridge {
  private readonly steps: number
  private readonly leftIndex: Int32Array
  private readonly rightIndex: Int32Array
  private readonly bridgeIndex: Int32Array
  private readonly leftWeight: Float64Array
  private readonly rightWeight: Float64Array
  private readonly stdDev: Float64Array

  constructor(steps: number) {
    this.steps = steps
    this.leftIndex = new Int32Array(steps)
    this.rightIndex = new Int32Array(steps)
    this.bridgeIndex = new Int32Array(steps)
    this.leftWeight = new Float64Array(steps)
    this.rightWeight = new Float64Array(steps)
    this.stdDev = new Float64Array(steps)

    const map = new Int32Array(steps)
    map[steps - 1] = 1
    this.bridgeIndex[0] = steps - 1
    this.stdDev[0] = Math.sqrt(steps)
    this.leftWeight[0] = 0
    this.rightWeight[0] = 0

    let j = 0
    for (let i = 1; i < steps; i += 1) {
      while (map[j] !== 0) j += 1
      let k = j
      while (map[k] === 0) k += 1
      const l = j + ((k - 1 - j) >> 1)
      map[l] = i
      this.bridgeIndex[i] = l
      this.leftIndex[i] = j
      this.rightIndex[i] = k
      this.leftWeight[i] = (k - l) / (k + 1 - j)
      this.rightWeight[i] = (l + 1 - j) / (k + 1 - j)
      this.stdDev[i] = Math.sqrt(((l + 1 - j) * (k - l)) / (k + 1 - j))
      j = k + 1
      if (j >= steps) j = 0
    }
  }

  buildPath(normals: Float64Array): Float64Array {
    const path = new Float64Array(this.steps)
    path[this.bridgeIndex[0]] = this.stdDev[0] * normals[0]
    for (let i = 1; i < this.steps; i += 1) {
      const l = this.leftIndex[i]
      const r = this.rightIndex[i]
      const b = this.bridgeIndex[i]
      const left = l === 0 ? 0 : path[l - 1]
      path[b] = this.leftWeight[i] * left + this.rightWeight[i] * path[r] + this.stdDev[i] * normals[i]
    }
    return path
  }

  increments(normals: Float64Array): Float64Array {
    const path = this.buildPath(normals)
    const result = new Float64Array(this.steps)
    result[0] = path[0]
    for (let i = 1; i < this.steps; i += 1) result[i] = path[i] - path[i - 1]
    return result
  }
}
