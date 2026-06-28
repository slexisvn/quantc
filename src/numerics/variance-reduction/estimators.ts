import { Welford } from '../stats/welford'

export interface Estimate {
  readonly mean: number
  readonly standardError: number
}

export function plainEstimate(samples: Float64Array): Estimate {
  const welford = new Welford()
  for (let i = 0; i < samples.length; i += 1) welford.push(samples[i])
  return { mean: welford.mean, standardError: welford.standardError }
}

export function antitheticEstimate(samples: Float64Array, antithetic: Float64Array): Estimate {
  const welford = new Welford()
  for (let i = 0; i < samples.length; i += 1) welford.push(0.5 * (samples[i] + antithetic[i]))
  return { mean: welford.mean, standardError: welford.standardError }
}

export function controlVariateEstimate(samples: Float64Array, controls: Float64Array, controlMean: number): Estimate {
  const n = samples.length
  let sampleMean = 0
  let controlSampleMean = 0
  for (let i = 0; i < n; i += 1) {
    sampleMean += samples[i]
    controlSampleMean += controls[i]
  }
  sampleMean /= n
  controlSampleMean /= n

  let covariance = 0
  let controlVariance = 0
  for (let i = 0; i < n; i += 1) {
    const dc = controls[i] - controlSampleMean
    covariance += (samples[i] - sampleMean) * dc
    controlVariance += dc * dc
  }
  const beta = controlVariance > 0 ? covariance / controlVariance : 0

  const welford = new Welford()
  for (let i = 0; i < n; i += 1) welford.push(samples[i] - beta * (controls[i] - controlMean))
  return { mean: welford.mean, standardError: welford.standardError }
}
