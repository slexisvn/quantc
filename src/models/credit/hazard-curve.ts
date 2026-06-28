export class HazardCurve {
  readonly times: number[]
  readonly hazards: number[]

  constructor(times: number[], hazards: number[]) {
    if (times.length !== hazards.length) throw new Error('hazard curve requires matching pillars')
    this.times = times
    this.hazards = hazards
  }

  survival(t: number): number {
    let integral = 0
    let previous = 0
    for (let i = 0; i < this.times.length; i += 1) {
      const segmentEnd = Math.min(this.times[i], t)
      if (segmentEnd > previous) integral += this.hazards[i] * (segmentEnd - previous)
      previous = this.times[i]
      if (this.times[i] >= t) break
    }
    if (t > previous) integral += this.hazards[this.hazards.length - 1] * (t - previous)
    return Math.exp(-integral)
  }
}
