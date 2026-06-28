import type { CharacteristicModel } from './characteristic'

function chi(k: number, a: number, b: number, c: number, d: number): number {
  const omega = (k * Math.PI) / (b - a)
  const cosD = Math.cos(omega * (d - a))
  const cosC = Math.cos(omega * (c - a))
  const sinD = Math.sin(omega * (d - a))
  const sinC = Math.sin(omega * (c - a))
  const expD = Math.exp(d)
  const expC = Math.exp(c)
  return (1 / (1 + omega * omega)) * (cosD * expD - cosC * expC + omega * sinD * expD - omega * sinC * expC)
}

function psi(k: number, a: number, b: number, c: number, d: number): number {
  if (k === 0) return d - c
  const omega = (k * Math.PI) / (b - a)
  return (Math.sin(omega * (d - a)) - Math.sin(omega * (c - a))) / omega
}

function payoffCoefficient(k: number, a: number, b: number, isCall: boolean): number {
  if (isCall) return (2 / (b - a)) * (chi(k, a, b, 0, b) - psi(k, a, b, 0, b))
  return (2 / (b - a)) * (-chi(k, a, b, a, 0) + psi(k, a, b, a, 0))
}

export function cosEuropeanPrice(model: CharacteristicModel, spot: number, strike: number, rate: number, maturity: number, isCall: boolean, terms = 1024, width = 12): number {
  const a = model.c1 - width * Math.sqrt(Math.abs(model.c2))
  const b = model.c1 + width * Math.sqrt(Math.abs(model.c2))
  const x = Math.log(spot / strike)

  let sum = 0
  for (let k = 0; k < terms; k += 1) {
    const omega = (k * Math.PI) / (b - a)
    const phi = model.cf(omega)
    const phase = omega * (x - a)
    const real = phi.re * Math.cos(phase) - phi.im * Math.sin(phase)
    const coefficient = payoffCoefficient(k, a, b, isCall)
    sum += (k === 0 ? 0.5 : 1) * real * coefficient
  }

  return strike * Math.exp(-rate * maturity) * sum
}
