import { describe, it, expect } from 'vitest'
import { aadLevenbergMarquardt, evaluateResidualJacobian, type TapeResidual } from '../src/engines/aad-calibration'
import { levenbergMarquardt } from '../src/engines/calibration'
import { constant, type Tape, type ANumber } from '../src/aad/tape'

const times = [0.5, 1, 1.5, 2, 2.5, 3]
const trueA = 2.5
const trueB = -0.4
const targets = times.map((t) => trueA * Math.exp(trueB * t))

const model: TapeResidual = (parameters: ANumber[], tape: Tape) =>
  times.map((t, i) => parameters[0].mul(parameters[1].mul(constant(tape, t)).exp()).sub(constant(tape, targets[i])))

const plainResidual = (x: number[]): number[] => times.map((t, i) => x[0] * Math.exp(x[1] * t) - targets[i])

describe('AAD Jacobian for calibration', () => {
  it('the reverse-mode Jacobian matches a central finite difference', () => {
    const point = [1.7, -0.7]
    const { jacobian } = evaluateResidualJacobian(model, point)
    const bump = 1e-6
    for (let p = 0; p < point.length; p += 1) {
      const up = [...point]
      const down = [...point]
      up[p] += bump
      down[p] -= bump
      const fdUp = plainResidual(up)
      const fdDown = plainResidual(down)
      for (let i = 0; i < times.length; i += 1) {
        const fd = (fdUp[i] - fdDown[i]) / (2 * bump)
        expect(jacobian[i][p]).toBeCloseTo(fd, 6)
      }
    }
  })

  it('recovers the true parameters and agrees with the finite-difference optimiser', () => {
    const aad = aadLevenbergMarquardt(model, [1, -1], { tolerance: 1e-16 })
    expect(aad.parameters[0]).toBeCloseTo(trueA, 5)
    expect(aad.parameters[1]).toBeCloseTo(trueB, 5)
    expect(aad.residualNorm).toBeLessThan(1e-5)

    const fd = levenbergMarquardt(plainResidual, [1, -1], { tolerance: 1e-16 })
    expect(aad.parameters[0]).toBeCloseTo(fd.parameters[0], 5)
    expect(aad.parameters[1]).toBeCloseTo(fd.parameters[1], 5)
  })
})
