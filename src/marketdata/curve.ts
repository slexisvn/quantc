function locate(times: readonly number[], t: number): number {
  let low = 0
  let high = times.length - 1
  while (high - low > 1) {
    const mid = (low + high) >> 1
    if (times[mid] <= t) low = mid
    else high = mid
  }
  return low
}

export class DiscountCurve {
  readonly times: number[]
  readonly zeroRates: number[]

  constructor(times: number[], zeroRates: number[]) {
    if (times.length !== zeroRates.length || times.length === 0) throw new Error('curve requires matching non-empty pillars')
    this.times = times
    this.zeroRates = zeroRates
  }

  zeroRate(t: number): number {
    if (t <= this.times[0]) return this.zeroRates[0]
    if (t >= this.times[this.times.length - 1]) return this.zeroRates[this.zeroRates.length - 1]
    const i = locate(this.times, t)
    const weight = (t - this.times[i]) / (this.times[i + 1] - this.times[i])
    return this.zeroRates[i] + weight * (this.zeroRates[i + 1] - this.zeroRates[i])
  }

  discountFactor(t: number): number {
    return Math.exp(-this.zeroRate(t) * t)
  }

  forwardRate(start: number, end: number): number {
    return (this.discountFactor(start) / this.discountFactor(end) - 1) / (end - start)
  }
}
