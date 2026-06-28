import { describe, it, expect } from 'vitest'
import { CompiledEuropeanPricer } from '../src/engines/compiled-pricer'
import { buildEuropeanGraph } from '../src/engines/european-graph'
import { evaluate } from '../src/eval/interpreter'
import { pooledEuropeanCall } from '../src/engines/parallel-mc'
import { Welford, combineMoments, standardErrorOf } from '../src/numerics/stats/welford'
import { plainPayoffs, type SampleMarket } from '../src/engines/european-samples'
import { runCli } from '../src/cli/index'
import { blackScholes } from '../src/numerics/analytic/black-scholes'
import { standardNormals } from '../src/numerics/sampling'

describe('compile once, reprice many (low latency)', () => {
  it('reuses a compiled kernel and matches the interpreter at every spot', () => {
    const pricer = new CompiledEuropeanPricer('max(spot - strike, 0)', 'gbm', 40000, 33)
    const built = buildEuropeanGraph('max(spot - strike, 0)', 'gbm')
    const normals = standardNormals(40000, 33)
    for (const spot of [80, 95, 100, 110, 125]) {
      const kernelPrice = pricer.reprice({ spot, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 })
      const inputs = new Map<number, Float64Array>([
        [built.inputs.spot.id, new Float64Array([spot])],
        [built.inputs.strike.id, new Float64Array([100])],
        [built.inputs.rate.id, new Float64Array([0.03])],
        [built.inputs.vol.id, new Float64Array([0.2])],
        [built.inputs.maturity.id, new Float64Array([1])],
        [built.inputs.normals.id, normals],
      ])
      const interpreted = evaluate(built.graph, inputs, 40000).get(built.price.id)![0]
      expect(kernelPrice).toBeCloseTo(interpreted, 9)
    }
  })
})

describe('parallel statistics (shard merge)', () => {
  it('combining shard moments equals a single-pass estimate exactly', () => {
    const payoffs = plainPayoffs({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, paths: 40000, seed: 5 })
    const full = new Welford()
    for (let i = 0; i < payoffs.length; i += 1) full.push(payoffs[i])

    const shardSize = 8000
    const states = []
    for (let start = 0; start < payoffs.length; start += shardSize) {
      const welford = new Welford()
      for (let i = start; i < start + shardSize; i += 1) welford.push(payoffs[i])
      states.push({ count: welford.count, mean: welford.mean, sumSquaredDeviations: welford.sumSquaredDeviations })
    }
    const combined = combineMoments(states)
    expect(combined.mean).toBeCloseTo(full.mean, 10)
    expect(standardErrorOf(combined)).toBeCloseTo(full.standardError, 10)
  })

  it('pooled Monte Carlo across shards is accurate', () => {
    const market: SampleMarket = { spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, paths: 50000, seed: 71 }
    const pooled = pooledEuropeanCall(market, 4)
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(pooled.paths).toBe(200000)
    expect(Math.abs(pooled.price - reference.price)).toBeLessThan(0.1)
  })
})

describe('CLI', () => {
  it('prices a European option from arguments', () => {
    const output = runCli(['--spot', '100', '--strike', '100', '--rate', '0.03', '--vol', '0.2', '--maturity', '1', '--paths', '50000', '--seed', '1'])
    expect(output).toContain('price')
    expect(output).toContain('delta')
    const priceLine = output.split('\n').find((line) => line.startsWith('price'))!
    const price = Number(priceLine.split(/\s+/)[1])
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(price - reference.price)).toBeLessThan(0.2)
  })
})
