import type { MersenneTwister } from './mersenne-twister'

export function poissonSample(mean: number, generator: MersenneTwister): number {
  const threshold = Math.exp(-mean)
  let count = 0
  let product = 1
  for (;;) {
    product *= generator.nextDouble()
    if (product <= threshold) return count
    count += 1
  }
}
