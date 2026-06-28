import { Graph } from '../ir/graph'
import { registerBuiltinOps } from '../ir/ops/index'
import type { Value } from '../ir/value'
import { standardNormals } from '../numerics/sampling'

export interface PathInputs {
  readonly spot: Value
  readonly strike: Value
  readonly rate: Value
  readonly vol: Value
  readonly maturity: Value
}

export interface GbmPath {
  readonly graph: Graph
  readonly inputs: PathInputs
  readonly normals: readonly Value[]
  readonly logFixings: readonly Value[]
  readonly fixings: readonly Value[]
  readonly terminal: Value
}

export interface PathConfig {
  readonly steps: number
}

export function buildGbmPath(config: PathConfig): GbmPath {
  registerBuiltinOps()
  const graph = new Graph()
  const spot = graph.input('scalar', 'spot')
  const strike = graph.input('scalar', 'strike')
  const rate = graph.input('scalar', 'rate')
  const vol = graph.input('scalar', 'vol')
  const maturity = graph.input('scalar', 'maturity')

  const steps = config.steps
  const dt = graph.div(maturity, graph.constant(steps))
  const half = graph.constant(0.5)
  const driftStep = graph.mul(graph.sub(rate, graph.mul(graph.mul(half, vol), vol)), dt)
  const volStep = graph.mul(vol, graph.sqrt(dt))

  const normals: Value[] = []
  const logFixings: Value[] = []
  const fixings: Value[] = []
  let logState = graph.log(spot)
  for (let i = 0; i < steps; i += 1) {
    const z = graph.input('batch', `z_${i}`)
    normals.push(z)
    logState = graph.add(graph.add(logState, driftStep), graph.mul(volStep, z))
    logFixings.push(logState)
    fixings.push(graph.exp(logState))
  }

  return { graph, inputs: { spot, strike, rate, vol, maturity }, normals, logFixings, fixings, terminal: fixings[fixings.length - 1] }
}

export interface PathMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
}

export function pathBindings(path: GbmPath, market: PathMarket): Map<number, Float64Array> {
  const bindings = new Map<number, Float64Array>([
    [path.inputs.spot.id, new Float64Array([market.spot])],
    [path.inputs.strike.id, new Float64Array([market.strike])],
    [path.inputs.rate.id, new Float64Array([market.rate])],
    [path.inputs.vol.id, new Float64Array([market.vol])],
    [path.inputs.maturity.id, new Float64Array([market.maturity])],
  ])
  for (let i = 0; i < path.normals.length; i += 1) {
    bindings.set(path.normals[i].id, standardNormals(market.paths, market.seed + i * 2654435761))
  }
  return bindings
}
