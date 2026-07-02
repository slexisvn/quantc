export interface ChebyshevDimension {
  readonly min: number
  readonly max: number
  readonly points: number
}

function chebyshevNodes(dimension: ChebyshevDimension): number[] {
  const mid = 0.5 * (dimension.min + dimension.max)
  const half = 0.5 * (dimension.max - dimension.min)
  const last = dimension.points - 1
  const nodes: number[] = new Array(dimension.points)
  for (let j = 0; j < dimension.points; j += 1) nodes[j] = mid + half * Math.cos((j * Math.PI) / last)
  return nodes
}

function barycentricWeights(points: number): number[] {
  const weights: number[] = new Array(points)
  for (let j = 0; j < points; j += 1) {
    const endpoint = j === 0 || j === points - 1 ? 0.5 : 1
    weights[j] = (j % 2 === 0 ? 1 : -1) * endpoint
  }
  return weights
}

export interface ChebyshevProxy {
  evaluate(point: readonly number[]): number
}

export function buildChebyshevProxy(pricer: (point: number[]) => number, dimensions: readonly ChebyshevDimension[]): ChebyshevProxy {
  const nodesPerDim = dimensions.map(chebyshevNodes)
  const weightsPerDim = dimensions.map((d) => barycentricWeights(d.points))
  const sizes = dimensions.map((d) => d.points)
  const dims = dimensions.length

  const strides: number[] = new Array(dims)
  let stride = 1
  for (let d = dims - 1; d >= 0; d -= 1) {
    strides[d] = stride
    stride *= sizes[d]
  }
  const total = stride
  const values = new Float64Array(total)
  const indices = new Array<number>(dims).fill(0)
  for (let flat = 0; flat < total; flat += 1) {
    let remainder = flat
    const point: number[] = new Array(dims)
    for (let d = 0; d < dims; d += 1) {
      const idx = Math.floor(remainder / strides[d]) % sizes[d]
      point[d] = nodesPerDim[d][idx]
    }
    values[flat] = pricer(point)
  }

  const interpolate = (query: readonly number[], dim: number): number => {
    if (dim === dims) {
      let flat = 0
      for (let d = 0; d < dims; d += 1) flat += indices[d] * strides[d]
      return values[flat]
    }
    const nodes = nodesPerDim[dim]
    const weights = weightsPerDim[dim]
    const x = query[dim]
    for (let j = 0; j < nodes.length; j += 1) {
      if (x === nodes[j]) {
        indices[dim] = j
        return interpolate(query, dim + 1)
      }
    }
    let numerator = 0
    let denominator = 0
    for (let j = 0; j < nodes.length; j += 1) {
      indices[dim] = j
      const term = weights[j] / (x - nodes[j])
      numerator += term * interpolate(query, dim + 1)
      denominator += term
    }
    return numerator / denominator
  }

  return { evaluate: (point) => interpolate(point, 0) }
}
