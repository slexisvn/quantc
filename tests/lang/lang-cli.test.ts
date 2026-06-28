import { describe, it, expect } from 'vitest'
import { checkScript, printScript, priceScript, runLangCli } from '../../src/lang/cli'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

const european = `
product EuropeanCall {
  underlying S model gbm
  param strike = 100
  event T = 1.0 { pay max(S(T) - strike, 0) at T }
}
`

describe('language CLI', () => {
  it('check reports no errors for a valid script', () => {
    expect(checkScript(european)).toEqual([])
  })

  it('check reports positioned errors for an invalid script', () => {
    const errors = checkScript('product P { underlying S model gbm  event T = 1.0 { pay missing at T } }')
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/^\d+:\d+: /)
  })

  it('print round-trips a script', () => {
    expect(printScript(printScript(european))).toBe(printScript(european))
  })

  it('price evaluates a script to the Black-Scholes price', () => {
    const result = priceScript(european, { spot: 100, rate: 0.03, vol: 0.2 }, 200000, 12345)
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.2)
  })

  it('runs example files end to end', () => {
    expect(runLangCli(['check', 'examples/european.quill'])).toBe('ok')
    expect(runLangCli(['check', 'examples/autocall.quill'])).toBe('ok')
    const output = runLangCli(['run', 'examples/european.quill', '--paths', '50000', '--seed', '1'])
    expect(output).toContain('price')
    expect(output).toContain('delta')
  })
})
