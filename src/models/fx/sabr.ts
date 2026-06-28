export interface SabrSpec {
  readonly forward: number
  readonly strike: number
  readonly maturity: number
  readonly alpha: number
  readonly beta: number
  readonly rho: number
  readonly volOfVol: number
}

export function sabrImpliedVol(spec: SabrSpec): number {
  const { forward, strike, maturity, alpha, beta, rho, volOfVol } = spec
  const oneMinusBeta = 1 - beta

  if (Math.abs(forward - strike) < 1e-12) {
    const term1 = (oneMinusBeta * oneMinusBeta / 24) * (alpha * alpha) / Math.pow(forward, 2 * oneMinusBeta)
    const term2 = (rho * beta * volOfVol * alpha) / (4 * Math.pow(forward, oneMinusBeta))
    const term3 = ((2 - 3 * rho * rho) / 24) * volOfVol * volOfVol
    return (alpha / Math.pow(forward, oneMinusBeta)) * (1 + (term1 + term2 + term3) * maturity)
  }

  const logFK = Math.log(forward / strike)
  const fkMid = Math.pow(forward * strike, oneMinusBeta / 2)
  const z = (volOfVol / alpha) * fkMid * logFK
  const xz = Math.log((Math.sqrt(1 - 2 * rho * z + z * z) + z - rho) / (1 - rho))

  const denominator = fkMid * (1 + (oneMinusBeta * oneMinusBeta / 24) * logFK * logFK + (Math.pow(oneMinusBeta, 4) / 1920) * Math.pow(logFK, 4))
  const term1 = (oneMinusBeta * oneMinusBeta / 24) * (alpha * alpha) / (fkMid * fkMid)
  const term2 = (rho * beta * volOfVol * alpha) / (4 * fkMid)
  const term3 = ((2 - 3 * rho * rho) / 24) * volOfVol * volOfVol
  return (alpha / denominator) * (z / xz) * (1 + (term1 + term2 + term3) * maturity)
}
