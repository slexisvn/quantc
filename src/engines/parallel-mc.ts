import { plainPayoffs, type SampleMarket } from './european-samples'
import { Welford, combineMoments, standardErrorOf, type MomentState } from '../numerics/stats/welford'

const SHARD_SEED_STRIDE = 0x9e3779b1

export interface PooledResult {
  readonly price: number
  readonly standardError: number
  readonly paths: number
}

export function pooledEuropeanCall(market: SampleMarket, shards: number): PooledResult {
  const states: MomentState[] = []
  for (let shard = 0; shard < shards; shard += 1) {
    const payoffs = plainPayoffs({ ...market, seed: (market.seed + shard * SHARD_SEED_STRIDE) >>> 0 })
    const welford = new Welford()
    for (let i = 0; i < payoffs.length; i += 1) welford.push(payoffs[i])
    states.push({ count: welford.count, mean: welford.mean, sumSquaredDeviations: welford.sumSquaredDeviations })
  }
  const combined = combineMoments(states)
  return { price: combined.mean, standardError: standardErrorOf(combined), paths: combined.count }
}
