import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../src/numerics/rng/inverse-normal-cdf'
import { polynomialBasis } from '../../src/numerics/basis'
import { expectedImProfile, bruteForceImProfile, type DynamicImConfig } from '../../src/xva/dynamic-im'
import { computeMva } from '../../src/xva/mva'
import { SIMM_PARAMETERS_ILLUSTRATIVE } from '../../src/xva/simm-parameters'
import type { SimmSensitivity } from '../../src/xva/simm'

const times = Array.from({ length: 8 }, (_, i) => (i + 1) * 0.25)

function statePaths(seed: number, paths: number): Float64Array[] {
  const generator = new MersenneTwister(seed)
  const nodes = times.map(() => new Float64Array(paths))
  for (let p = 0; p < paths; p += 1) {
    let logSpot = Math.log(100)
    let previous = 0
    for (let k = 0; k < times.length; k += 1) {
      const dt = times[k] - previous
      logSpot += (0.02 - 0.5 * 0.2 * 0.2) * dt + 0.2 * Math.sqrt(dt) * inverseNormalCdf(generator.nextDouble())
      nodes[k][p] = Math.exp(logSpot)
      previous = times[k]
    }
  }
  return nodes
}

const constantSensitivities = (): SimmSensitivity[] => [{ riskClass: 'IR', bucket: '1', label: '5y', amount: 1000, kind: 'delta' }]

describe('dynamic IM and MVA', () => {
  it('a constant IM gives MVA = spread·IM·annuity in closed form', () => {
    const expected = times.map(() => 500)
    const fundingSpread = 0.01
    const mva = computeMva(expected, times, { fundingSpread, discount: () => 1 })
    expect(mva).toBeCloseTo(fundingSpread * 500 * times[times.length - 1], 9)
  })

  it('the regressed expected-IM profile matches the brute-force SIMM over all paths', () => {
    const paths = statePaths(77, 8000)
    const config: DynamicImConfig = {
      times,
      statePaths: paths,
      basis: polynomialBasis(2),
      ridgeLambda: 1e-6,
      subsample: 2000,
      params: SIMM_PARAMETERS_ILLUSTRATIVE,
      sensitivities: constantSensitivities,
    }
    const regressed = expectedImProfile(config)
    const brute = bruteForceImProfile(config)
    for (let k = 0; k < times.length; k += 1) expect(Math.abs(regressed[k] - brute[k]) / brute[k]).toBeLessThan(1e-6)
  })

  it('a state-dependent IM regression tracks the brute-force conditional expectation', () => {
    const paths = statePaths(91, 8000)
    const stateSensitivities = (state: number): SimmSensitivity[] => [{ riskClass: 'IR', bucket: '1', label: '5y', amount: state, kind: 'delta' }]
    const config: DynamicImConfig = {
      times,
      statePaths: paths,
      basis: polynomialBasis(2),
      ridgeLambda: 1e-6,
      subsample: 4000,
      params: SIMM_PARAMETERS_ILLUSTRATIVE,
      sensitivities: stateSensitivities,
    }
    const regressed = expectedImProfile(config)
    const brute = bruteForceImProfile(config)
    for (let k = 0; k < times.length; k += 1) expect(Math.abs(regressed[k] - brute[k]) / brute[k]).toBeLessThan(1e-3)
  })
})
