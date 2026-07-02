import { describe, it, expect } from 'vitest'
import { girrDeltaCharge, girrTenorCorrelation, type GirrSensitivity } from '../../src/risk/frtb-ir'
import { drcCharge, type DrcPosition } from '../../src/risk/frtb-drc'
import { rraoCharge } from '../../src/risk/frtb-rrao'
import { liquidityAdjustedEs, imaCapital, nmrfStressCharge } from '../../src/risk/ima-es'
import { FRTB_PARAMETERS_STANDARD } from '../../src/risk/frtb-parameters'
import { historicalExpectedShortfall } from '../../src/risk/var'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../src/numerics/rng/inverse-normal-cdf'

const params = FRTB_PARAMETERS_STANDARD

describe('FRTB GIRR delta', () => {
  it('a single tenor charges RW·|s|', () => {
    const sensitivities: GirrSensitivity[] = [{ tenor: 2, amount: 100 }]
    expect(girrDeltaCharge(sensitivities, params)).toBeCloseTo(0.013 * 100, 12)
  })

  it('two tenors match the hand-computed scenario maximum', () => {
    const sensitivities: GirrSensitivity[] = [{ tenor: 2, amount: 100 }, { tenor: 5, amount: 100 }]
    expect(girrDeltaCharge(sensitivities, params)).toBeCloseTo(Math.sqrt(1.69 + 1.21 + 2.86), 10)
  })

  it('the high-correlation scenario dominates the medium one for aligned sensitivities', () => {
    const sensitivities: GirrSensitivity[] = [{ tenor: 2, amount: 100 }, { tenor: 5, amount: 100 }]
    const medium = girrDeltaCharge(sensitivities, { ...params, correlationScenarios: [1] })
    const high = girrDeltaCharge(sensitivities, { ...params, correlationScenarios: [1.25] })
    expect(high).toBeGreaterThanOrEqual(medium)
  })

  it('the correlation floor binds for widely separated tenors', () => {
    expect(girrTenorCorrelation(params.girr, 0.25, 30)).toBeCloseTo(params.girr.correlationFloor, 12)
  })
})

describe('FRTB DRC', () => {
  it('matches the hand-computed hedge-benefit ratio', () => {
    const positions: DrcPosition[] = [
      { obligor: 'X', seniority: 0, jtd: 100, maturity: 1, rating: 'BBB' },
      { obligor: 'Y', seniority: 0, jtd: -50, maturity: 1, rating: 'BBB' },
    ]
    expect(drcCharge(positions, params)).toBeCloseTo(0.06 * 100 - (100 / 150) * 0.06 * 50, 10)
  })

  it('offsets a same-obligor same-seniority long and short to zero', () => {
    const positions: DrcPosition[] = [
      { obligor: 'X', seniority: 0, jtd: 100, maturity: 1, rating: 'BBB' },
      { obligor: 'X', seniority: 0, jtd: -100, maturity: 1, rating: 'BBB' },
    ]
    expect(drcCharge(positions, params)).toBeCloseTo(0, 12)
  })

  it('a senior short offsets a junior long but a junior short does not offset a senior long', () => {
    const seniorShort: DrcPosition[] = [
      { obligor: 'X', seniority: 0, jtd: -100, maturity: 1, rating: 'BBB' },
      { obligor: 'X', seniority: 1, jtd: 100, maturity: 1, rating: 'BBB' },
    ]
    const juniorShort: DrcPosition[] = [
      { obligor: 'X', seniority: 0, jtd: 100, maturity: 1, rating: 'BBB' },
      { obligor: 'X', seniority: 1, jtd: -100, maturity: 1, rating: 'BBB' },
    ]
    expect(drcCharge(seniorShort, params)).toBeCloseTo(0, 12)
    expect(drcCharge(juniorShort, params)).toBeGreaterThan(0)
  })
})

describe('FRTB RRAO', () => {
  it('is linear in notional', () => {
    const single = rraoCharge([{ notional: 1_000_000, kind: 'exotic' }, { notional: 2_000_000, kind: 'other' }], params)
    expect(single).toBeCloseTo(0.01 * 1_000_000 + 0.001 * 2_000_000, 6)
    const doubled = rraoCharge([{ notional: 2_000_000, kind: 'exotic' }, { notional: 4_000_000, kind: 'other' }], params)
    expect(doubled).toBeCloseTo(2 * single, 6)
  })
})

function normalPnl(seed: number, count: number, scale: number): Float64Array {
  const generator = new MersenneTwister(seed)
  const out = new Float64Array(count)
  for (let i = 0; i < count; i += 1) out[i] = scale * inverseNormalCdf(generator.nextDouble())
  return out
}

describe('IMA liquidity-adjusted ES', () => {
  it('a single base-horizon bucket equals the plain historical ES', () => {
    const pnl = normalPnl(11, 500, 1)
    expect(liquidityAdjustedEs([pnl], params)).toBeCloseTo(historicalExpectedShortfall(pnl, params.esConfidence), 12)
  })

  it('adding liquidity-horizon buckets raises the total ES', () => {
    const pnl = normalPnl(11, 500, 1)
    const single = liquidityAdjustedEs([pnl], params)
    const multi = liquidityAdjustedEs([pnl, pnl], params)
    expect(multi).toBeGreaterThan(single)
  })

  it('applies the max formula and floors the stress ratio at one', () => {
    const result = imaCapital({ esReducedStressed: 100, esFullCurrent: 120, esReducedCurrent: 80, previousImcc: 140, averageImcc: 150, nmrf: 20 }, params)
    expect(result.imcc).toBeCloseTo(150, 10)
    expect(result.capital).toBeCloseTo(Math.max(140 + 20, 1.5 * 150 + 20), 10)
    const floored = imaCapital({ esReducedStressed: 100, esFullCurrent: 60, esReducedCurrent: 80, previousImcc: 0, averageImcc: 0, nmrf: 0 }, params)
    expect(floored.imcc).toBeCloseTo(100, 10)
  })

  it('the single-rho NMRF charge interpolates between comonotone and independent aggregation', () => {
    expect(nmrfStressCharge([3, 4], 0)).toBeCloseTo(5, 12)
    expect(nmrfStressCharge([3, 4], 1)).toBeCloseTo(7, 12)
    expect(nmrfStressCharge([3, 4], 0.5)).toBeCloseTo(Math.sqrt(3.5 * 3.5 + 0.75 * 25), 12)
  })
})
