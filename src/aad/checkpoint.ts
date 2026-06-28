export interface StepDerivatives {
  readonly carry: number
  readonly dCarryPrev: number
  readonly dParam: number
}

export type ForwardStep = (carryPrev: number, param: number, step: number) => StepDerivatives

export interface CheckpointedGradient {
  readonly finalCarry: number
  readonly dParam: number
  readonly dCarry0: number
  readonly maxStored: number
}

export function checkpointedGradient(steps: number, carry0: number, param: number, forwardStep: ForwardStep, segment?: number): CheckpointedGradient {
  const segmentLength = segment ?? Math.max(1, Math.round(Math.sqrt(steps)))

  const checkpoints: number[] = [carry0]
  let carry = carry0
  for (let t = 0; t < steps; t += 1) {
    carry = forwardStep(carry, param, t).carry
    if ((t + 1) % segmentLength === 0 && t + 1 < steps) checkpoints.push(carry)
  }
  const finalCarry = carry

  let adjointCarry = 1
  let dParam = 0
  let maxStored = checkpoints.length

  const numSegments = Math.ceil(steps / segmentLength)
  for (let s = numSegments - 1; s >= 0; s -= 1) {
    const start = s * segmentLength
    const end = Math.min(start + segmentLength, steps)
    const dCarryPrev: number[] = []
    const dParamStep: number[] = []
    let segmentCarry = checkpoints[s]
    for (let t = start; t < end; t += 1) {
      const step = forwardStep(segmentCarry, param, t)
      dCarryPrev.push(step.dCarryPrev)
      dParamStep.push(step.dParam)
      segmentCarry = step.carry
    }
    maxStored = Math.max(maxStored, checkpoints.length + dCarryPrev.length)
    for (let i = end - start - 1; i >= 0; i -= 1) {
      dParam += adjointCarry * dParamStep[i]
      adjointCarry *= dCarryPrev[i]
    }
  }

  return { finalCarry, dParam, dCarry0: adjointCarry, maxStored }
}
