const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI)
const HART_NUMERATOR = [0.0352624965998911, 0.700383064443688, 6.37396220353165, 33.912866078383, 112.079291497871, 221.213596169931, 220.206867912376]
const HART_DENOMINATOR = [0.0883883476483184, 1.75566716318264, 16.064177579207, 86.7807322029461, 296.564248779674, 637.333633378831, 793.826512519948, 440.413735824752]

export function normalPdf(x: number): number {
  return INV_SQRT_2PI * Math.exp(-0.5 * x * x)
}

export function normalCdf(x: number): number {
  const absX = Math.abs(x)
  if (absX > 37) return x > 0 ? 1 : 0
  const exponential = Math.exp(-0.5 * absX * absX)
  let lowerTail: number
  if (absX < 7.07106781186547) {
    let numerator = HART_NUMERATOR[0]
    for (let i = 1; i < HART_NUMERATOR.length; i += 1) numerator = numerator * absX + HART_NUMERATOR[i]
    let denominator = HART_DENOMINATOR[0]
    for (let i = 1; i < HART_DENOMINATOR.length; i += 1) denominator = denominator * absX + HART_DENOMINATOR[i]
    lowerTail = (exponential * numerator) / denominator
  } else {
    let fraction = absX + 0.65
    fraction = absX + 4 / fraction
    fraction = absX + 3 / fraction
    fraction = absX + 2 / fraction
    fraction = absX + 1 / fraction
    lowerTail = exponential / fraction / 2.506628274631
  }
  return x > 0 ? 1 - lowerTail : lowerTail
}

export interface BlackScholesInputs {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly isCall: boolean
}

export interface BlackScholesResult {
  readonly price: number
  readonly delta: number
  readonly vega: number
  readonly gamma: number
  readonly vanna: number
  readonly volga: number
  readonly rho: number
  readonly theta: number
}

export function blackScholes(input: BlackScholesInputs): BlackScholesResult {
  const { spot, strike, rate, vol, maturity, isCall } = input
  const sqrtT = Math.sqrt(maturity)
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * vol * vol) * maturity) / (vol * sqrtT)
  const d2 = d1 - vol * sqrtT
  const discount = Math.exp(-rate * maturity)
  const pdfD1 = normalPdf(d1)
  const vega = spot * pdfD1 * sqrtT
  const gamma = pdfD1 / (spot * vol * sqrtT)
  const vanna = -pdfD1 * d2 / vol
  const volga = vega * d1 * d2 / vol
  const sign = isCall ? 1 : -1
  const delta = isCall ? normalCdf(d1) : normalCdf(d1) - 1
  const theta = -spot * pdfD1 * vol / (2 * sqrtT) - sign * rate * strike * discount * normalCdf(sign * d2)
  const rho = sign * strike * maturity * discount * normalCdf(sign * d2)
  const price = isCall
    ? spot * normalCdf(d1) - strike * discount * normalCdf(d2)
    : strike * discount * normalCdf(-d2) - spot * normalCdf(-d1)

  return { price, delta, vega, gamma, vanna, volga, rho, theta }
}
