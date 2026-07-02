const LANCZOS = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]

export function logGamma(x: number): number {
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let series = 1.000000000190015
  for (let j = 0; j < LANCZOS.length; j += 1) {
    y += 1
    series += LANCZOS[j] / y
  }
  return -tmp + Math.log((2.5066282746310005 * series) / x)
}

function gammaSeries(a: number, x: number): number {
  let ap = a
  let sum = 1 / a
  let del = sum
  for (let n = 0; n < 500; n += 1) {
    ap += 1
    del *= x / ap
    sum += del
    if (Math.abs(del) < Math.abs(sum) * 1e-16) break
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
}

function gammaContinuedFraction(a: number, x: number): number {
  const tiny = 1e-300
  let b = x + 1 - a
  let c = 1 / tiny
  let d = 1 / b
  let h = d
  for (let i = 1; i < 500; i += 1) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < tiny) d = tiny
    c = b + an / c
    if (Math.abs(c) < tiny) c = tiny
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-16) break
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
}

export function regularizedGammaP(a: number, x: number): number {
  if (x <= 0 || a <= 0) return 0
  if (x < a + 1) return gammaSeries(a, x)
  return 1 - gammaContinuedFraction(a, x)
}

export function chiSquareCdf(x: number, degreesOfFreedom: number): number {
  if (x <= 0) return 0
  return regularizedGammaP(degreesOfFreedom / 2, x / 2)
}
