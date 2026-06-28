import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { priceProduct } from '../../src/lang/compile'
import { pricePde } from '../../src/engines/pde-engine'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

describe('compiled Quill language — early exercise (in-graph LSM)', () => {
  const bermudan = parseProduct(`
    product BermudanPut {
      underlying S model gbm
      param strike = 100
      event t in schedule(0.05, 1.0, 0.05) {
        exercise continuation { pay max(strike - S(t), 0) at t }
      }
    }
  `)

  it('prices an American/Bermudan put in agreement with the PDE solver', () => {
    const result = priceProduct(bermudan, { spot: 100, rate: 0.05, vol: 0.2 }, 100000, 4321)
    const pde = pricePde({
      spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1,
      isCall: false, american: true, spaceSteps: 801, timeSteps: 400, widthStdDev: 6, rannacherSteps: 4,
    })
    expect(Math.abs(result.price - pde.price)).toBeLessThan(0.15)
  })

  it('the early-exercise premium is positive (exceeds the European put)', () => {
    const result = priceProduct(bermudan, { spot: 100, rate: 0.05, vol: 0.2 }, 100000, 4321)
    const european = blackScholes({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: false })
    expect(result.price).toBeGreaterThan(european.price)
  })
})
