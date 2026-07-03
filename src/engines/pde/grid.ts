export interface LogSpaceGrid {
  readonly nodes: Float64Array
  readonly center: number
  readonly halfWidth: number
  readonly dx: number
  readonly centerIndex: number
}

export function logSpaceGrid(spot: number, vol: number, maturity: number, widthStdDev: number, spaceSteps: number): LogSpaceGrid {
  const center = Math.log(spot)
  const halfWidth = widthStdDev * vol * Math.sqrt(maturity)
  const dx = (2 * halfWidth) / (spaceSteps - 1)
  const nodes = new Float64Array(spaceSteps)
  for (let i = 0; i < spaceSteps; i += 1) nodes[i] = center - halfWidth + i * dx
  return { nodes, center, halfWidth, dx, centerIndex: Math.round(halfWidth / dx) }
}
