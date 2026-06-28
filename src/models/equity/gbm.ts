import type { MarketModel, ModelContext } from '../model-registry'
import type { Value } from '../../ir/value'

export const gbm: MarketModel = {
  name: 'gbm',
  terminal(context: ModelContext): Value {
    const g = context.graph
    const half = g.constant(0.5)
    const variance = g.mul(g.mul(half, context.vol), context.vol)
    const drift = g.mul(g.sub(context.rate, variance), context.maturity)
    const diffusion = g.mul(g.mul(context.vol, g.sqrt(context.maturity)), context.normals)
    const logTerminal = g.add(g.add(g.log(context.spot), drift), diffusion)
    return g.exp(logTerminal)
  },
}
