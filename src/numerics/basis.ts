export interface Basis {
  readonly size: number
  evaluate(x: number | readonly number[]): number[]
  derivative?(x: number): number[]
}

export type BasisFactory = (degree: number, dimension?: number) => Basis

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

const factories = new Map<string, BasisFactory>([
  ['polynomial', polynomialBasis],
  ['laguerre', (degree, dimension) => laguerreBasis(dimension === undefined ? degree : degree)],
])

export function registerBasis(name: string, factory: BasisFactory): void {
  if (factories.has(name)) throw new Error(`duplicate basis ${name}`)
  factories.set(name, factory)
}

export function getBasis(name: string, degree: number, dimension?: number): Basis {
  const factory = factories.get(name)
  if (factory === undefined) throw new Error(`unknown basis ${name}`)
  return factory(degree, dimension)
}
