import { priceEuropean } from '../src/engines/mc-engine'
import { pricePde } from '../src/engines/pde-engine'
import { priceUpAndOutCall } from '../src/engines/exotics'
import { priceBermudanLsm } from '../src/engines/longstaff-schwartz'
import { calibrateSabr } from '../src/engines/sabr-calibration'
import { computeCva } from '../src/risk/xva'
import { CompiledEuropeanPricer } from '../src/engines/compiled-pricer'
import { sabrImpliedVol } from '../src/models/fx/sabr'

const european = priceEuropean({
  payoff: 'max(spot - strike, 0)',
  spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1,
  paths: 200000, seed: 20240627, model: 'gbm',
})
console.log('European MC price', european.price.toFixed(4), 'delta', european.greeks.delta.toFixed(4), 'gamma', european.greeks.gamma.toFixed(5))

const pde = pricePde({
  spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1,
  isCall: true, american: false, spaceSteps: 801, timeSteps: 400, widthStdDev: 6, rannacherSteps: 4,
})
console.log('European PDE price', pde.price.toFixed(4))

const barrier = priceUpAndOutCall({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, paths: 100000, seed: 1 }, 50, 130, 0.5)
console.log('Up-and-out barrier price', barrier.price.toFixed(4), 'delta', barrier.delta.toFixed(4))

const american = priceBermudanLsm({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: false, exerciseDates: 50, paths: 80000, seed: 7 })
console.log('American put (LSM)', american.toFixed(4))

const quotes = [1.0, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5].map((strike) => ({
  strike,
  vol: sabrImpliedVol({ forward: 1.25, strike, maturity: 1, alpha: 0.18, beta: 0.5, rho: -0.25, volOfVol: 0.45 }),
}))
const calibrated = calibrateSabr({ forward: 1.25, maturity: 1, beta: 0.5, quotes, initialAlpha: 0.25, initialRho: 0, initialVolOfVol: 0.3 })
console.log('SABR calibrated alpha/rho/nu', calibrated.alpha.toFixed(4), calibrated.rho.toFixed(4), calibrated.volOfVol.toFixed(4))

const cva = computeCva({ spot: 100, strike: 100, rate: 0.02, vol: 0.25, maturity: 2, hazardRate: 0.03, recovery: 0.4, exposureDates: 24, paths: 40000, seed: 808 })
console.log('CVA', cva.cva.toFixed(4))

const pricer = new CompiledEuropeanPricer('max(spot - strike, 0)', 'gbm', 100000, 99)
console.log('Compiled reprice @95/100/105', [95, 100, 105].map((spot) => pricer.reprice({ spot, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 }).toFixed(4)).join(' '))
