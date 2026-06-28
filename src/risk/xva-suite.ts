import type { ExposureProfile } from './exposure'

export interface XvaSpec {
  readonly rate: number
  readonly hazardRate: number
  readonly recovery: number
  readonly ownHazardRate: number
  readonly ownRecovery: number
  readonly fundingSpread: number
}

export interface XvaResult {
  readonly cva: number
  readonly dva: number
  readonly fva: number
  readonly mva: number
}

function survival(hazard: number, time: number): number {
  return Math.exp(-hazard * time)
}

export function computeXva(profile: ExposureProfile, spec: XvaSpec): XvaResult {
  let cva = 0
  let dva = 0
  let fva = 0
  let mva = 0
  let previousTime = 0

  for (let k = 0; k < profile.times.length; k += 1) {
    const time = profile.times[k]
    const discount = Math.exp(-spec.rate * time)
    const counterpartyDefault = survival(spec.hazardRate, previousTime) - survival(spec.hazardRate, time)
    const ownDefault = survival(spec.ownHazardRate, previousTime) - survival(spec.ownHazardRate, time)
    const dt = time - previousTime

    cva += (1 - spec.recovery) * profile.epe[k] * discount * counterpartyDefault
    dva += (1 - spec.ownRecovery) * -profile.ene[k] * discount * ownDefault

    const unfunded = Math.max(profile.collateralEpe[k], 0)
    fva += spec.fundingSpread * unfunded * discount * survival(spec.hazardRate, time) * dt

    const initialMargin = Math.max(profile.pfe[k] - profile.epe[k], 0)
    mva += spec.fundingSpread * initialMargin * discount * survival(spec.hazardRate, time) * dt

    previousTime = time
  }

  return { cva, dva, fva, mva }
}

export interface WrongWayResult {
  readonly independent: number
  readonly wrongWay: number
}

export function wrongWayCva(profile: ExposureProfile, spec: { rate: number; hazardRate: number; recovery: number; correlation: number; spot: number }): WrongWayResult {
  const steps = profile.times.length
  const paths = profile.spotPaths[0].length
  let independent = 0
  let wrongWay = 0
  let previousTime = 0

  for (let k = 0; k < steps; k += 1) {
    const time = profile.times[k]
    const discount = Math.exp(-spec.rate * time)
    const baseDefault = Math.exp(-spec.hazardRate * previousTime) - Math.exp(-spec.hazardRate * time)

    let sumExposure = 0
    let sumWeighted = 0
    let sumWeights = 0
    for (let p = 0; p < paths; p += 1) {
      const exposure = Math.max(profile.mtmPaths[k][p], 0)
      const stress = Math.exp(spec.correlation * (spec.spot - profile.spotPaths[k][p]) / spec.spot)
      sumExposure += exposure
      sumWeighted += exposure * stress
      sumWeights += stress
    }
    independent += (1 - spec.recovery) * (sumExposure / paths) * discount * baseDefault
    wrongWay += (1 - spec.recovery) * (sumWeighted / sumWeights) * discount * baseDefault

    previousTime = time
  }

  return { independent, wrongWay }
}
