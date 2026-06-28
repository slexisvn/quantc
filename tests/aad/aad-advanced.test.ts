import { describe, it, expect } from 'vitest'
import { Tape, variable, constant, gradientOf } from '../../src/aad/tape'
import { checkpointedGradient } from '../../src/aad/checkpoint'
import { digitalCallLrDelta } from '../../src/numerics/variance-reduction/likelihood-ratio'
import { digitalCallDelta } from '../../src/numerics/analytic/digital'
import { parameterQuoteSensitivity, priceQuoteSensitivity } from '../../src/risk/implicit-calibration'
import { impliedVolatility } from '../../src/engines/calibration'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { computeCvaSensitivities } from '../../src/risk/aad-xva'
import { computeCva, type CvaSpec } from '../../src/risk/xva'

describe('runtime operator-overloading tape (Savine)', () => {
  it('matches analytic gradient of a nonlinear function', () => {
    const tape = new Tape()
    const x = variable(tape, 0.5)
    const y = variable(tape, 2)
    const f = x.exp().mul(y).add(x.mul(x))
    const [dx, dy] = gradientOf(tape, f, [x, y])
    expect(dx).toBeCloseTo(Math.exp(0.5) * 2 + 2 * 0.5, 10)
    expect(dy).toBeCloseTo(Math.exp(0.5), 10)
    expect(constant(tape, 1).value).toBe(1)
  })
})

describe('sqrt-T checkpointing', () => {
  it('reproduces the full-tape gradient with sub-linear memory', () => {
    const steps = 400
    const a = 0.99
    const forwardStep = (carryPrev: number, param: number): { carry: number; dCarryPrev: number; dParam: number } => ({
      carry: a * carryPrev + param,
      dCarryPrev: a,
      dParam: 1,
    })
    const checkpointed = checkpointedGradient(steps, 1, 0.5, forwardStep)

    let analytic = 0
    for (let k = 0; k < steps; k += 1) analytic += Math.pow(a, k)
    expect(checkpointed.dParam).toBeCloseTo(analytic, 8)
    expect(checkpointed.maxStored).toBeLessThan(steps / 2)
  })
})

describe('likelihood-ratio Greeks (Broadie-Glasserman)', () => {
  it('digital-call LR delta matches the analytic delta without smoothing', () => {
    const market = { spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, paths: 500000, seed: 17 }
    const lr = digitalCallLrDelta(market)
    const analytic = digitalCallDelta({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 })
    expect(Math.abs(lr.delta - analytic)).toBeLessThan(3 * lr.standardError + 1e-4)
  })
})

describe('AAD-through-calibration (implicit function theorem)', () => {
  it('price sensitivity to a calibration quote matches finite-difference re-calibration', () => {
    const spot = 100
    const rate = 0.02
    const maturity = 1
    const calibStrike = 100
    const priceStrike = 120
    const trueVol = 0.25
    const quote = blackScholes({ spot, strike: calibStrike, rate, vol: trueVol, maturity, isCall: true }).price

    const residual = (theta: number[], quotes: number[]): number[] => [
      blackScholes({ spot, strike: calibStrike, rate, vol: theta[0], maturity, isCall: true }).price - quotes[0],
    ]
    const vol = impliedVolatility({ price: quote, spot, strike: calibStrike, rate, maturity, isCall: true })
    const dThetaDQuote = parameterQuoteSensitivity(residual, [vol], [quote])
    const pricedGreeks = blackScholes({ spot, strike: priceStrike, rate, vol, maturity, isCall: true })
    const sensitivity = priceQuoteSensitivity([pricedGreeks.vega], dThetaDQuote)[0]

    const bump = 0.01
    const repriceAtQuote = (q: number): number => {
      const v = impliedVolatility({ price: q, spot, strike: calibStrike, rate, maturity, isCall: true })
      return blackScholes({ spot, strike: priceStrike, rate, vol: v, maturity, isCall: true }).price
    }
    const fd = (repriceAtQuote(quote + bump) - repriceAtQuote(quote - bump)) / (2 * bump)
    expect(sensitivity).toBeCloseTo(fd, 4)
  })
})

describe('AAD-XVA sensitivities', () => {
  const spec: CvaSpec = {
    spot: 100, strike: 100, rate: 0.02, vol: 0.25, maturity: 2,
    hazardRate: 0.03, recovery: 0.4, exposureDates: 24, paths: 60000, seed: 4040,
  }

  it('reproduces the CVA and matches bump-and-revalue sensitivities', () => {
    const sensitivities = computeCvaSensitivities(spec)
    expect(sensitivities.cva).toBeCloseTo(computeCva(spec).cva, 10)

    const hazardBump = 1e-4
    const dHazardFd = (computeCva({ ...spec, hazardRate: spec.hazardRate + hazardBump }).cva - computeCva({ ...spec, hazardRate: spec.hazardRate - hazardBump }).cva) / (2 * hazardBump)
    expect(Math.abs(sensitivities.dHazard - dHazardFd)).toBeLessThan(0.05)

    const spotBump = 0.05
    const dSpotFd = (computeCva({ ...spec, spot: spec.spot + spotBump }).cva - computeCva({ ...spec, spot: spec.spot - spotBump }).cva) / (2 * spotBump)
    expect(Math.abs(sensitivities.dSpot - dSpotFd)).toBeLessThan(0.02)
  })
})
