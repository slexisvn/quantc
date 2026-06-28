import { type Complex, complex, add, sub, mul, div, scale, exp, log, sqrt } from '../numerics/complex'

export interface CharacteristicModel {
  readonly cf: (u: number) => Complex
  readonly c1: number
  readonly c2: number
}

export function blackScholesCf(rate: number, vol: number, maturity: number): CharacteristicModel {
  const drift = rate - 0.5 * vol * vol
  return {
    cf: (u: number): Complex => exp(complex(-0.5 * vol * vol * u * u * maturity, u * drift * maturity)),
    c1: drift * maturity,
    c2: vol * vol * maturity,
  }
}

export interface MertonParams {
  readonly vol: number
  readonly jumpIntensity: number
  readonly jumpMean: number
  readonly jumpVol: number
}

export function mertonCf(rate: number, maturity: number, p: MertonParams): CharacteristicModel {
  const kappa = Math.exp(p.jumpMean + 0.5 * p.jumpVol * p.jumpVol) - 1
  const drift = rate - 0.5 * p.vol * p.vol - p.jumpIntensity * kappa
  return {
    cf: (u: number): Complex => {
      const diffusion = complex(-0.5 * p.vol * p.vol * u * u * maturity, u * drift * maturity)
      const jumpCf = exp(complex(-0.5 * p.jumpVol * p.jumpVol * u * u, u * p.jumpMean))
      const jump = scale(sub(jumpCf, complex(1, 0)), p.jumpIntensity * maturity)
      return exp(add(diffusion, jump))
    },
    c1: drift * maturity + p.jumpIntensity * maturity * p.jumpMean,
    c2: p.vol * p.vol * maturity + p.jumpIntensity * maturity * (p.jumpMean * p.jumpMean + p.jumpVol * p.jumpVol),
  }
}

export interface HestonParams {
  readonly initialVariance: number
  readonly meanReversion: number
  readonly longVariance: number
  readonly volOfVol: number
  readonly correlation: number
}

export function hestonCf(rate: number, maturity: number, p: HestonParams): CharacteristicModel {
  const { initialVariance: v0, meanReversion: kappa, longVariance: theta, volOfVol: xi, correlation: rho } = p
  return {
    cf: (u: number): Complex => {
      const iu = complex(0, u)
      const rhoXiIu = scale(iu, rho * xi)
      const kMinus = sub(complex(kappa, 0), rhoXiIu)
      const rhoXiIuMinusKappa = sub(rhoXiIu, complex(kappa, 0))
      const term1 = mul(rhoXiIuMinusKappa, rhoXiIuMinusKappa)
      const term2 = scale(complex(u * u, u), xi * xi)
      const d = sqrt(add(term1, term2))
      const kMinusMinusD = sub(kMinus, d)
      const kMinusPlusD = add(kMinus, d)
      const g = div(kMinusMinusD, kMinusPlusD)
      const eDt = exp(scale(d, -maturity))
      const oneMinusGeDt = sub(complex(1, 0), mul(g, eDt))
      const oneMinusG = sub(complex(1, 0), g)
      const logTerm = log(div(oneMinusGeDt, oneMinusG))
      const cBracket = sub(scale(kMinusMinusD, maturity), scale(logTerm, 2))
      const c = add(scale(iu, rate * maturity), scale(cBracket, (kappa * theta) / (xi * xi)))
      const dCoefficient = mul(scale(kMinusMinusD, 1 / (xi * xi)), div(sub(complex(1, 0), eDt), oneMinusGeDt))
      return exp(add(c, scale(dCoefficient, v0)))
    },
    c1: (rate - 0.5 * theta) * maturity,
    c2: theta * maturity + ((v0 - theta) * (1 - Math.exp(-kappa * maturity))) / kappa,
  }
}
