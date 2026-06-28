import { evaluate } from '../eval/interpreter'
import { reverse } from '../aad/reverse'
import { buildEuropeanGraph } from './european-graph'
import { standardNormals } from '../numerics/sampling'
import { Welford } from '../numerics/stats/welford'
import type { Value } from '../ir/value'

export interface EuropeanSpec {
  readonly payoff: string
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
  readonly model: string
}

export interface PricingResult {
  readonly price: number
  readonly standardError: number
  readonly greeks: Readonly<Record<string, number>>
}

function scalar(value: number): Float64Array {
  return new Float64Array([value])
}

function requireValue(values: Map<number, Float64Array>, id: number): Float64Array {
  const value = values.get(id)
  if (value === undefined) throw new Error(`missing value ${id}`)
  return value
}

interface ValuationWithGradient {
  readonly price: number
  readonly standardError: number
  readonly gradient: Readonly<Record<string, number>>
}

function valueAndGradient(spec: EuropeanSpec): ValuationWithGradient {
  const built = buildEuropeanGraph(spec.payoff, spec.model)
  const draws = standardNormals(spec.paths, spec.seed)
  const bindings = new Map<number, Float64Array>([
    [built.inputs.spot.id, scalar(spec.spot)],
    [built.inputs.strike.id, scalar(spec.strike)],
    [built.inputs.rate.id, scalar(spec.rate)],
    [built.inputs.vol.id, scalar(spec.vol)],
    [built.inputs.maturity.id, scalar(spec.maturity)],
    [built.inputs.normals.id, draws],
  ])

  const forward = evaluate(built.graph, bindings, spec.paths)
  const price = requireValue(forward, built.price.id)[0]

  const samples = requireValue(forward, built.discounted.id)
  const welford = new Welford()
  for (let i = 0; i < samples.length; i += 1) welford.push(samples[i])

  const gradients = reverse(built.graph, forward, new Map([[built.price.id, scalar(1)]]))
  const read = (value: Value): number => {
    const grad = gradients.get(value.id)
    return grad === undefined ? 0 : grad[0]
  }

  return {
    price,
    standardError: welford.standardError,
    gradient: {
      delta: read(built.inputs.spot),
      vega: read(built.inputs.vol),
      rho: read(built.inputs.rate),
      theta: -read(built.inputs.maturity),
    },
  }
}

export function priceEuropean(spec: EuropeanSpec): PricingResult {
  const base = valueAndGradient(spec)

  const spotBump = Math.max(spec.spot * 1e-4, 1e-6)
  const volBump = Math.max(spec.vol * 1e-3, 1e-6)
  const deltaUp = valueAndGradient({ ...spec, spot: spec.spot + spotBump }).gradient.delta
  const deltaDown = valueAndGradient({ ...spec, spot: spec.spot - spotBump }).gradient.delta
  const upVol = valueAndGradient({ ...spec, vol: spec.vol + volBump }).gradient
  const downVol = valueAndGradient({ ...spec, vol: spec.vol - volBump }).gradient

  const gamma = (deltaUp - deltaDown) / (2 * spotBump)
  const vanna = (upVol.delta - downVol.delta) / (2 * volBump)
  const volga = (upVol.vega - downVol.vega) / (2 * volBump)

  return {
    price: base.price,
    standardError: base.standardError,
    greeks: {
      delta: base.gradient.delta,
      vega: base.gradient.vega,
      rho: base.gradient.rho,
      theta: base.gradient.theta,
      gamma,
      vanna,
      volga,
    },
  }
}
