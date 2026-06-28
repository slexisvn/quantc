import { describe, it, expect } from 'vitest'
import { cholesky, correlate } from '../src/numerics/linalg/cholesky'
import { jamshidianPayerSwaption, monteCarloPayerSwaption, type VasicekModel, type Swaption } from '../src/models/rates/vasicek-swaption'
import { priceLmmCaplet, blackCaplet } from '../src/models/rates/lmm'

describe('Cholesky factorisation', () => {
  it('reconstructs a correlation matrix', () => {
    const matrix = [
      [1, 0.5, 0.3],
      [0.5, 1, 0.4],
      [0.3, 0.4, 1],
    ]
    const lower = cholesky(matrix)
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        let value = 0
        for (let k = 0; k < 3; k += 1) value += lower[i][k] * lower[j][k]
        expect(value).toBeCloseTo(matrix[i][j], 12)
      }
    }
    expect(correlate(lower, [1, 0, 0])[0]).toBeCloseTo(1, 12)
  })
})

describe('Hull-White / Vasicek swaption', () => {
  it('Jamshidian closed form matches the short-rate Monte Carlo', () => {
    const model: VasicekModel = { shortRate: 0.03, meanReversion: 0.1, longRate: 0.03, vol: 0.01 }
    const swaption: Swaption = {
      expiry: 1,
      times: [2, 3, 4, 5],
      accruals: [1, 1, 1, 1],
      fixedRate: 0.03,
    }
    const closedForm = jamshidianPayerSwaption(model, swaption)
    const mc = monteCarloPayerSwaption(model, swaption, 100, 200000, 31)
    expect(Math.abs(closedForm - mc)).toBeLessThan(2e-4)
  })
})

describe('Libor Market Model', () => {
  it('caplet Monte Carlo matches the Black caplet at the calibration vol', () => {
    const spec = {
      rateCount: 6,
      accrual: 0.5,
      initialForward: 0.03,
      vol: 0.2,
      capletIndex: 3,
      strike: 0.03,
      paths: 300000,
      seed: 71,
    }
    const lmm = priceLmmCaplet(spec)
    const fixingTime = spec.capletIndex * spec.accrual
    const discount = 1 / Math.pow(1 + spec.accrual * spec.initialForward, spec.capletIndex + 1)
    const black = blackCaplet(spec.initialForward, spec.strike, spec.vol, fixingTime, spec.accrual, discount)
    expect(Math.abs(lmm.price - black)).toBeLessThan(3 * lmm.standardError + 1e-5)
  })
})
