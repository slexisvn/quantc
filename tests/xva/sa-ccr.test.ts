import { describe, it, expect } from 'vitest'
import { saccrEad, supervisoryDuration, type SaccrTrade, type SaccrCsa } from '../../src/xva/sa-ccr'
import { SACCR_PARAMETERS_BASEL } from '../../src/xva/sa-ccr-parameters'

const params = SACCR_PARAMETERS_BASEL

describe('SA-CCR EAD', () => {
  const trade: SaccrTrade = { assetClass: 'IR', notional: 1_000_000, startTime: 0, endTime: 5, direction: 1 }
  const ir = params.assetClasses.get('IR')!

  it('reproduces the Basel arithmetic for one IR swap at par', () => {
    const sd = supervisoryDuration(0, 5, params.supervisoryDurationRate)
    const adjusted = trade.notional * sd
    const maturityFactor = Math.sqrt(Math.min(5, 1))
    const addOn = ir.supervisoryFactor * adjusted * maturityFactor
    const expectedEad = params.alpha * addOn

    const result = saccrEad([trade], 0, params)
    expect(result.addOn).toBeCloseTo(addOn, 6)
    expect(result.replacementCost).toBeCloseTo(0, 12)
    expect(result.multiplier).toBeCloseTo(1, 12)
    expect(result.ead).toBeCloseTo(expectedEad, 6)
  })

  it('keeps the PFE multiplier within [floor, 1] and below 1 when deeply out-of-the-money', () => {
    const negative = saccrEad([trade], -50_000, params)
    expect(negative.multiplier).toBeGreaterThanOrEqual(params.multiplierFloor)
    expect(negative.multiplier).toBeLessThan(1)
  })

  it('a margined CSA uses the margin-period maturity factor', () => {
    const csa: SaccrCsa = { currentCollateral: 0, threshold: 0, minimumTransfer: 0, independentAmount: 0, marginPeriodOfRisk: 10 / 250 }
    const result = saccrEad([trade], 0, params, csa)
    const adjusted = trade.notional * supervisoryDuration(0, 5, params.supervisoryDurationRate)
    const margined = ir.supervisoryFactor * adjusted * 1.5 * Math.sqrt(10 / 250)
    expect(result.addOn).toBeCloseTo(margined, 4)
  })
})
