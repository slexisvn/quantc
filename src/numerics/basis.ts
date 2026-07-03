import { createRegistry } from '../registry'

export interface Basis {
  readonly size: number
  evaluate(x: number | readonly number[]): number[]
  derivative?(x: number): number[]
}

export type BasisFactory = (degree: number, dimension?: number) => Basis

export function evaluateBasis(basis: Basis, coefficients: readonly number[], x: number): number {
  const features = basis.evaluate(x)
  let value = 0
  for (let i = 0; i < features.length; i += 1) value += features[i] * coefficients[i]
  return value
}

function monomialExponents(dimension: number, degree: number): number[][] {
  const result: number[][] = []
  const current = new Array<number>(dimension).fill(0)
  const recurse = (position: number, remaining: number): void => {
    if (position === dimension) {
      result.push(current.slice())
      return
    }
    for (let exponent = 0; exponent <= remaining; exponent += 1) {
      current[position] = exponent
      recurse(position + 1, remaining - exponent)
    }
  }
  recurse(0, degree)
  return result
}

function asVector(x: number | readonly number[]): readonly number[] {
  return typeof x === 'number' ? [x] : x
}

export function polynomialBasis(degree: number, dimension = 1): Basis {
  const exponents = monomialExponents(dimension, degree)
  const basis: Basis = {
    size: exponents.length,
    evaluate(x) {
      const vector = asVector(x)
      return exponents.map((exponent) => {
        let value = 1
        for (let d = 0; d < exponent.length; d += 1) value *= Math.pow(vector[d], exponent[d])
        return value
      })
    },
  }
  if (dimension === 1) {
    basis.derivative = (x: number) => exponents.map(([exponent]) => (exponent === 0 ? 0 : exponent * Math.pow(x, exponent - 1)))
  }
  return basis
}

export function laguerreBasis(degree: number): Basis {
  return {
    size: degree + 1,
    evaluate(x) {
      const point = asVector(x)[0]
      const values = new Array<number>(degree + 1)
      values[0] = 1
      if (degree >= 1) values[1] = 1 - point
      for (let k = 1; k < degree; k += 1) {
        values[k + 1] = ((2 * k + 1 - point) * values[k] - k * values[k - 1]) / (k + 1)
      }
      return values
    },
  }
}

const factories = createRegistry<BasisFactory>('basis', [
  ['polynomial', polynomialBasis],
  ['laguerre', (degree, dimension) => laguerreBasis(dimension === undefined ? degree : degree)],
])

export function registerBasis(name: string, factory: BasisFactory): void {
  factories.register(name, factory)
}

export function getBasis(name: string, degree: number, dimension?: number): Basis {
  return factories.get(name)(degree, dimension)
}
