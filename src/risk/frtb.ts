export interface FrtbSensitivity {
  readonly bucket: number
  readonly sensitivity: number
  readonly riskWeight: number
}

export interface FrtbCorrelations {
  readonly withinBucket: number
  readonly acrossBucket: number
}

export function deltaRiskCharge(sensitivities: readonly FrtbSensitivity[], correlations: FrtbCorrelations): number {
  const buckets = new Map<number, number[]>()
  for (const sensitivity of sensitivities) {
    const weighted = sensitivity.sensitivity * sensitivity.riskWeight
    const existing = buckets.get(sensitivity.bucket)
    if (existing !== undefined) existing.push(weighted)
    else buckets.set(sensitivity.bucket, [weighted])
  }

  const bucketKeys = [...buckets.keys()]
  const kb: number[] = []
  const sb: number[] = []
  for (const key of bucketKeys) {
    const weighted = buckets.get(key)!
    let variance = 0
    let sum = 0
    for (let i = 0; i < weighted.length; i += 1) {
      sum += weighted[i]
      for (let j = 0; j < weighted.length; j += 1) variance += (i === j ? 1 : correlations.withinBucket) * weighted[i] * weighted[j]
    }
    kb.push(Math.sqrt(Math.max(variance, 0)))
    sb.push(sum)
  }

  let total = 0
  for (let b = 0; b < bucketKeys.length; b += 1) {
    for (let c = 0; c < bucketKeys.length; c += 1) {
      total += (b === c ? 1 : correlations.acrossBucket) * (b === c ? kb[b] * kb[b] : sb[b] * sb[c])
    }
  }
  return Math.sqrt(Math.max(total, 0))
}

export function vegaRiskCharge(sensitivities: readonly FrtbSensitivity[], correlations: FrtbCorrelations): number {
  return deltaRiskCharge(sensitivities, correlations)
}

export interface CurvaturePosition {
  readonly bucket: number
  readonly cvrUp: number
  readonly cvrDown: number
}

export function curvatureRiskCharge(positions: readonly CurvaturePosition[], correlations: FrtbCorrelations): number {
  const buckets = new Map<number, number[]>()
  for (const position of positions) {
    const cvr = -Math.min(position.cvrUp, position.cvrDown)
    const existing = buckets.get(position.bucket)
    if (existing !== undefined) existing.push(cvr)
    else buckets.set(position.bucket, [cvr])
  }

  const keys = [...buckets.keys()]
  const kb: number[] = []
  const sb: number[] = []
  for (const key of keys) {
    const cvr = buckets.get(key)!
    let variance = 0
    let sum = 0
    for (let i = 0; i < cvr.length; i += 1) {
      sum += cvr[i]
      for (let j = 0; j < cvr.length; j += 1) {
        const psi = cvr[i] < 0 && cvr[j] < 0 ? 0 : 1
        variance += (i === j ? Math.max(cvr[i], 0) * Math.max(cvr[i], 0) : correlations.withinBucket * cvr[i] * cvr[j] * psi)
      }
    }
    kb.push(Math.sqrt(Math.max(variance, 0)))
    sb.push(sum)
  }

  let total = 0
  for (let b = 0; b < keys.length; b += 1) {
    for (let c = 0; c < keys.length; c += 1) {
      if (b === c) total += kb[b] * kb[b]
      else {
        const psi = sb[b] < 0 && sb[c] < 0 ? 0 : 1
        total += correlations.acrossBucket * sb[b] * sb[c] * psi
      }
    }
  }
  return Math.sqrt(Math.max(total, 0))
}

export function standardisedCapital(delta: number, vega: number, curvature: number, defaultCharge: number): number {
  return delta + vega + curvature + defaultCharge
}

export function defaultRiskCharge(exposures: readonly { jtd: number; riskWeight: number }[]): number {
  let longCharge = 0
  let shortCharge = 0
  for (const exposure of exposures) {
    const weighted = exposure.jtd * exposure.riskWeight
    if (weighted >= 0) longCharge += weighted
    else shortCharge += -weighted
  }
  return Math.max(longCharge - 0.5 * shortCharge, 0)
}
