export class Tape {
  readonly values: number[] = []
  private readonly parents: number[][] = []
  private readonly partials: number[][] = []

  push(value: number, parents: number[], partials: number[]): number {
    const index = this.values.length
    this.values.push(value)
    this.parents.push(parents)
    this.partials.push(partials)
    return index
  }

  gradients(outputIndex: number): Float64Array {
    const adjoint = new Float64Array(this.values.length)
    adjoint[outputIndex] = 1
    for (let i = this.values.length - 1; i >= 0; i -= 1) {
      const seed = adjoint[i]
      if (seed === 0) continue
      const parents = this.parents[i]
      const partials = this.partials[i]
      for (let k = 0; k < parents.length; k += 1) adjoint[parents[k]] += seed * partials[k]
    }
    return adjoint
  }
}

export class ANumber {
  constructor(readonly tape: Tape, readonly index: number) {}

  get value(): number {
    return this.tape.values[this.index]
  }

  private unary(value: number, partial: number): ANumber {
    return new ANumber(this.tape, this.tape.push(value, [this.index], [partial]))
  }

  private binary(other: ANumber, value: number, selfPartial: number, otherPartial: number): ANumber {
    return new ANumber(this.tape, this.tape.push(value, [this.index, other.index], [selfPartial, otherPartial]))
  }

  add(other: ANumber): ANumber {
    return this.binary(other, this.value + other.value, 1, 1)
  }

  sub(other: ANumber): ANumber {
    return this.binary(other, this.value - other.value, 1, -1)
  }

  mul(other: ANumber): ANumber {
    return this.binary(other, this.value * other.value, other.value, this.value)
  }

  div(other: ANumber): ANumber {
    return this.binary(other, this.value / other.value, 1 / other.value, -this.value / (other.value * other.value))
  }

  neg(): ANumber {
    return this.unary(-this.value, -1)
  }

  exp(): ANumber {
    const value = Math.exp(this.value)
    return this.unary(value, value)
  }

  log(): ANumber {
    return this.unary(Math.log(this.value), 1 / this.value)
  }

  sqrt(): ANumber {
    const value = Math.sqrt(this.value)
    return this.unary(value, 1 / (2 * value))
  }

  max(other: ANumber): ANumber {
    return this.value >= other.value ? this.binary(other, this.value, 1, 0) : this.binary(other, other.value, 0, 1)
  }
}

export function constant(tape: Tape, value: number): ANumber {
  return new ANumber(tape, tape.push(value, [], []))
}

export function variable(tape: Tape, value: number): ANumber {
  return new ANumber(tape, tape.push(value, [], []))
}

export function gradientOf(tape: Tape, output: ANumber, variables: readonly ANumber[]): number[] {
  const adjoint = tape.gradients(output.index)
  return variables.map((variable) => adjoint[variable.index])
}
