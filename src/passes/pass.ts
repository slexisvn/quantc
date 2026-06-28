import type { Graph } from '../ir/graph'

export interface GraphPass {
  readonly name: string
  run(graph: Graph): boolean
}

export class PassManager {
  private readonly passes: GraphPass[] = []

  add(pass: GraphPass): this {
    this.passes.push(pass)
    return this
  }

  run(graph: Graph): boolean {
    let changed = false
    for (const pass of this.passes) {
      if (pass.run(graph)) changed = true
    }
    return changed
  }
}

export class FixedPointGroup implements GraphPass {
  readonly name: string
  private readonly passes: GraphPass[]
  private readonly maxIterations: number

  constructor(name: string, passes: GraphPass[], maxIterations = 16) {
    this.name = name
    this.passes = passes
    this.maxIterations = maxIterations
  }

  run(graph: Graph): boolean {
    let everChanged = false
    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      let changed = false
      for (const pass of this.passes) {
        if (pass.run(graph)) changed = true
      }
      if (!changed) break
      everChanged = true
    }
    return everChanged
  }
}
