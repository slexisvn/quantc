export interface CirSpec {
  readonly initialIntensity: number
  readonly meanReversion: number
  readonly longIntensity: number
  readonly vol: number
}

export function cirSurvival(spec: CirSpec, maturity: number): number {
  const { initialIntensity: lambda0, meanReversion: kappa, longIntensity: theta, vol: sigma } = spec
  const gamma = Math.sqrt(kappa * kappa + 2 * sigma * sigma)
  const expGammaT = Math.exp(gamma * maturity)
  const denominator = (gamma + kappa) * (expGammaT - 1) + 2 * gamma
  const b = (2 * (expGammaT - 1)) / denominator
  const a = Math.pow((2 * gamma * Math.exp(((kappa + gamma) * maturity) / 2)) / denominator, (2 * kappa * theta) / (sigma * sigma))
  return a * Math.exp(-b * lambda0)
}
