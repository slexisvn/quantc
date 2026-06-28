import { Tape, variable, constant, gradientOf } from '../aad/tape'

export interface KeyRateResult {
  readonly value: number
  readonly sensitivities: number[]
}

export function swapKeyRateSensitivities(times: number[], zeroRates: number[], accruals: number[], fixedRate: number, maturityIndex: number): KeyRateResult {
  const tape = new Tape()
  const rates = zeroRates.map((rate) => variable(tape, rate))
  const discountFactor = (i: number) => rates[i].mul(constant(tape, -times[i])).exp()

  let value = constant(tape, 1).sub(discountFactor(maturityIndex))
  for (let i = 0; i <= maturityIndex; i += 1) {
    value = value.sub(constant(tape, fixedRate * accruals[i]).mul(discountFactor(i)))
  }

  return { value: value.value, sensitivities: gradientOf(tape, value, rates) }
}
