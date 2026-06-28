import { describe, it, expect } from 'vitest'
import { priceBermudanLsm, type BermudanSpec } from '../src/engines/longstaff-schwartz'
import { pricePde } from '../src/engines/pde-engine'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

describe('Longstaff-Schwartz American/Bermudan vs PDE', () => {
  const spec: BermudanSpec = {
    spot: 100,
    strike: 100,
    rate: 0.05,
    vol: 0.2,
    maturity: 1,
    isCall: false,
    exerciseDates: 50,
    paths: 80000,
    seed: 12321,
  }

  it('American put from LSM agrees with the PDE solver', () => {
    const lsm = priceBermudanLsm(spec)
    const pde = pricePde({
      spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1,
      isCall: false, american: true, spaceSteps: 801, timeSteps: 400, widthStdDev: 6, rannacherSteps: 4,
    })
    expect(Math.abs(lsm - pde.price)).toBeLessThan(0.1)
  })

  it('American put exceeds the European put', () => {
    const lsm = priceBermudanLsm(spec)
    const european = blackScholes({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: false })
    expect(lsm).toBeGreaterThan(european.price)
  })
})
