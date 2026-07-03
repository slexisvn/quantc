export interface Tick {
  readonly price: number
  readonly volume: number
}

export interface Bar {
  readonly open: number
  readonly high: number
  readonly low: number
  readonly close: number
  readonly volume: number
  readonly dollarVolume: number
  readonly ticks: number
}

export function buildBars(ticks: readonly Tick[], measure: (tick: Tick) => number, threshold: number): Bar[] {
  const bars: Bar[] = []
  let open = 0
  let high = -Infinity
  let low = Infinity
  let volume = 0
  let dollarVolume = 0
  let count = 0
  let accumulated = 0
  for (const tick of ticks) {
    if (count === 0) open = tick.price
    high = Math.max(high, tick.price)
    low = Math.min(low, tick.price)
    volume += tick.volume
    dollarVolume += tick.price * tick.volume
    count += 1
    accumulated += measure(tick)
    if (accumulated >= threshold) {
      bars.push({ open, high, low, close: tick.price, volume, dollarVolume, ticks: count })
      high = -Infinity
      low = Infinity
      volume = 0
      dollarVolume = 0
      count = 0
      accumulated = 0
    }
  }
  return bars
}

export function tickBars(ticks: readonly Tick[], ticksPerBar: number): Bar[] {
  return buildBars(ticks, () => 1, ticksPerBar)
}

export function volumeBars(ticks: readonly Tick[], volumePerBar: number): Bar[] {
  return buildBars(ticks, (tick) => tick.volume, volumePerBar)
}

export function dollarBars(ticks: readonly Tick[], dollarPerBar: number): Bar[] {
  return buildBars(ticks, (tick) => tick.price * tick.volume, dollarPerBar)
}

export const BARS: Record<string, (ticks: readonly Tick[], threshold: number) => Bar[]> = {
  tick: tickBars,
  volume: volumeBars,
  dollar: dollarBars,
}
