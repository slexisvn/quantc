export interface Complex {
  readonly re: number
  readonly im: number
}

export function complex(re: number, im: number): Complex {
  return { re, im }
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im }
}

export function mul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
}

export function div(a: Complex, b: Complex): Complex {
  const denominator = b.re * b.re + b.im * b.im
  return { re: (a.re * b.re + a.im * b.im) / denominator, im: (a.im * b.re - a.re * b.im) / denominator }
}

export function scale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s }
}

export function exp(a: Complex): Complex {
  const magnitude = Math.exp(a.re)
  return { re: magnitude * Math.cos(a.im), im: magnitude * Math.sin(a.im) }
}

export function log(a: Complex): Complex {
  return { re: 0.5 * Math.log(a.re * a.re + a.im * a.im), im: Math.atan2(a.im, a.re) }
}

export function sqrt(a: Complex): Complex {
  const magnitude = Math.sqrt(Math.sqrt(a.re * a.re + a.im * a.im))
  const angle = Math.atan2(a.im, a.re) / 2
  return { re: magnitude * Math.cos(angle), im: magnitude * Math.sin(angle) }
}
