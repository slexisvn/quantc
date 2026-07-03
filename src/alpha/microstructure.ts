import { ols, withIntercept } from './regression'
import { meanStd } from './util'
import { normalCdf } from '../numerics/analytic/black-scholes'
import { volumeBars, type Tick } from './bars'

export function tickRule(prices: readonly number[]): number[] {
  const signs = new Array<number>(prices.length).fill(0)
  let last = 0
  for (let i = 1; i < prices.length; i += 1) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) last = 1
    else if (change < 0) last = -1
    signs[i] = last
  }
  return signs
}

export function rollSpread(prices: readonly number[]): number {
  const changes: number[] = []
  for (let i = 1; i < prices.length; i += 1) changes.push(prices[i] - prices[i - 1])
  const n = changes.length - 1
  if (n < 1) return 0
  let meanCurrent = 0
  let meanLagged = 0
  for (let i = 1; i < changes.length; i += 1) {
    meanCurrent += changes[i]
    meanLagged += changes[i - 1]
  }
  meanCurrent /= n
  meanLagged /= n
  let covariance = 0
  for (let i = 1; i < changes.length; i += 1) covariance += (changes[i] - meanCurrent) * (changes[i - 1] - meanLagged)
  covariance /= n
  return covariance < 0 ? 2 * Math.sqrt(-covariance) : 0
}

export function amihudIlliquidity(returns: readonly number[], dollarVolumes: readonly number[]): number {
  const n = Math.min(returns.length, dollarVolumes.length)
  if (n === 0) return 0
  let total = 0
  for (let i = 0; i < n; i += 1) total += Math.abs(returns[i]) / Math.max(dollarVolumes[i], 1e-12)
  return total / n
}

export function kyleLambda(prices: readonly number[], volumes: readonly number[]): number {
  const signs = tickRule(prices)
  const design: number[][] = []
  const response: number[] = []
  for (let i = 1; i < prices.length; i += 1) {
    design.push([signs[i] * volumes[i]])
    response.push(prices[i] - prices[i - 1])
  }
  return ols(withIntercept(design), response).coefficients[1]
}

export function vpin(ticks: readonly Tick[], bucketVolume: number, window = 50): number[] {
  const buckets = volumeBars(ticks, bucketVolume)
  const changes = buckets.map((bucket) => bucket.close - bucket.open)
  const { std } = meanStd(changes)
  const imbalances = buckets.map((bucket, i) => {
    const buyFraction = std < 1e-12 ? 0.5 : normalCdf(changes[i] / std)
    return Math.abs(2 * buyFraction - 1) * bucket.volume
  })
  const out = new Array<number>(buckets.length).fill(0)
  let imbalanceSum = 0
  let volumeSum = 0
  for (let i = 0; i < buckets.length; i += 1) {
    imbalanceSum += imbalances[i]
    volumeSum += buckets[i].volume
    if (i >= window) {
      imbalanceSum -= imbalances[i - window]
      volumeSum -= buckets[i - window].volume
    }
    out[i] = volumeSum < 1e-12 ? 0 : imbalanceSum / volumeSum
  }
  return out
}
