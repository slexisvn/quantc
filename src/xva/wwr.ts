import { HazardCurve } from '../models/credit/hazard-curve'
import { conditionalDefaultProbability } from '../models/credit/gaussian-copula'

export interface WrongWayLink {
  base(t: number): number
  hazard(t: number, driver: number): number
}

export function exponentialHazardLink(baseHazard: (t: number) => number, beta: number, referenceDriver: number): WrongWayLink {
  return {
    base: baseHazard,
    hazard(t, driver) {
      return baseHazard(t) * Math.exp(beta * (driver - referenceDriver))
    },
  }
}

function segmentHazard(curve: HazardCurve, t: number): number {
  for (let i = 0; i < curve.times.length; i += 1) {
    if (curve.times[i] >= t) return curve.hazards[i]
  }
  return curve.hazards[curve.hazards.length - 1]
}

export function copulaHazardLink(curve: HazardCurve, correlation: number): WrongWayLink {
  return {
    base(t) {
      return segmentHazard(curve, t)
    },
    hazard(t, driver) {
      const cumulative = 1 - curve.survival(t)
      if (cumulative <= 0) return segmentHazard(curve, t)
      const conditional = conditionalDefaultProbability(cumulative, correlation, driver)
      return segmentHazard(curve, t) * (conditional / cumulative)
    },
  }
}

export interface WrongWayCvaResult {
  readonly cva: number
  readonly standardError: number
}

export function wrongWayCvaPathwise(
  times: readonly number[],
  mtmPaths: readonly Float64Array[],
  driverPaths: readonly Float64Array[],
  link: WrongWayLink,
  recovery: number,
  discount: (t: number) => number,
): WrongWayCvaResult {
  const steps = times.length
  const paths = mtmPaths.length > 0 ? mtmPaths[0].length : 0

  const scale = new Float64Array(steps)
  let previous = 0
  for (let k = 0; k < steps; k += 1) {
    let mean = 0
    for (let p = 0; p < paths; p += 1) mean += link.hazard(times[k], driverPaths[k][p])
    mean /= paths
    scale[k] = mean > 0 ? link.base(times[k]) / mean : 0
    previous = times[k]
  }

  const survival = new Float64Array(paths).fill(1)
  const contribution = new Float64Array(paths)
  previous = 0
  for (let k = 0; k < steps; k += 1) {
    const time = times[k]
    const dt = time - previous
    const df = discount(time)
    for (let p = 0; p < paths; p += 1) {
      const hazard = link.hazard(time, driverPaths[k][p]) * scale[k]
      const previousSurvival = survival[p]
      const nextSurvival = previousSurvival * Math.exp(-hazard * dt)
      const defaultProbability = previousSurvival - nextSurvival
      survival[p] = nextSurvival
      contribution[p] += (1 - recovery) * Math.max(mtmPaths[k][p], 0) * df * defaultProbability
    }
    previous = time
  }

  let sum = 0
  let sumSquares = 0
  for (let p = 0; p < paths; p += 1) {
    sum += contribution[p]
    sumSquares += contribution[p] * contribution[p]
  }
  const mean = sum / paths
  const variance = Math.max(sumSquares / paths - mean * mean, 0)
  return { cva: mean, standardError: Math.sqrt(variance / paths) }
}
