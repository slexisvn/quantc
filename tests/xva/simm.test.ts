import { describe, it, expect } from 'vitest'
import { simmMargin, type SimmSensitivity } from '../../src/xva/simm'
import { registerSimmParameters, type SimmParameters, type SimmRiskClassParameters } from '../../src/xva/simm-parameters'

function riskClass(overrides: Partial<SimmRiskClassParameters>): SimmRiskClassParameters {
  return {
    buckets: ['1', '2'],
    deltaRiskWeights: new Map<string, number>([['a', 2], ['b', 3]]),
    defaultDeltaRiskWeight: 1,
    vegaRiskWeight: 0.5,
    intraBucketCorrelation: 0.5,
    interBucketCorrelation: 0.25,
    ...overrides,
  }
}

const params: SimmParameters = { riskClasses: new Map([['IR', riskClass({})]]), crossRiskClassCorrelation: 0.1 }
registerSimmParameters('test-simm', params)

const zeroIntra: SimmParameters = { riskClasses: new Map([['IR', riskClass({ intraBucketCorrelation: 0 })]]), crossRiskClassCorrelation: 0.1 }

describe('SIMM engine', () => {
  it('a single delta sensitivity margins to RW·|s|', () => {
    const sensitivities: SimmSensitivity[] = [{ riskClass: 'IR', bucket: '1', label: 'a', amount: 10, kind: 'delta' }]
    expect(simmMargin(sensitivities, params)).toBeCloseTo(2 * 10, 12)
  })

  it('zero intra-bucket correlation aggregates as the Euclidean norm', () => {
    const sensitivities: SimmSensitivity[] = [
      { riskClass: 'IR', bucket: '1', label: 'x', amount: 3, kind: 'delta' },
      { riskClass: 'IR', bucket: '1', label: 'y', amount: 4, kind: 'delta' },
    ]
    expect(simmMargin(sensitivities, zeroIntra)).toBeCloseTo(5, 12)
  })

  it('matches a hand-computed two-bucket aggregation to 1e-12', () => {
    const sensitivities: SimmSensitivity[] = [
      { riskClass: 'IR', bucket: '1', label: 'x', amount: 6, kind: 'delta' },
      { riskClass: 'IR', bucket: '2', label: 'y', amount: 8, kind: 'delta' },
    ]
    const expected = Math.sqrt(36 + 64 + 2 * 0.25 * 6 * 8)
    expect(simmMargin(sensitivities, params)).toBeCloseTo(expected, 12)
    expect(expected).toBeCloseTo(Math.sqrt(124), 12)
  })

  it('adds delta and vega margins', () => {
    const sensitivities: SimmSensitivity[] = [
      { riskClass: 'IR', bucket: '1', label: 'a', amount: 10, kind: 'delta' },
      { riskClass: 'IR', bucket: '1', label: 'v', amount: 4, kind: 'vega' },
    ]
    expect(simmMargin(sensitivities, params)).toBeCloseTo(2 * 10 + 0.5 * 4, 12)
  })
})
