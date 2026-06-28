import { MersenneTwister } from '../rng/mersenne-twister'

export interface DifferentialEvolutionOptions {
  readonly populationSize: number
  readonly generations: number
  readonly differentialWeight: number
  readonly crossoverProbability: number
  readonly seed: number
}

export interface OptimizationResult {
  readonly point: number[]
  readonly value: number
}

const DEFAULTS: DifferentialEvolutionOptions = { populationSize: 40, generations: 300, differentialWeight: 0.7, crossoverProbability: 0.9, seed: 1 }

export function differentialEvolution(objective: (x: number[]) => number, lower: number[], upper: number[], options: Partial<DifferentialEvolutionOptions> = {}): OptimizationResult {
  const config = { ...DEFAULTS, ...options }
  const dimension = lower.length
  const generator = new MersenneTwister(config.seed)
  const random = (): number => generator.nextDouble()

  const population: number[][] = []
  const fitness: number[] = []
  for (let i = 0; i < config.populationSize; i += 1) {
    const candidate = lower.map((low, j) => low + random() * (upper[j] - low))
    population.push(candidate)
    fitness.push(objective(candidate))
  }

  let bestIndex = 0
  for (let i = 1; i < config.populationSize; i += 1) if (fitness[i] < fitness[bestIndex]) bestIndex = i

  for (let generation = 0; generation < config.generations; generation += 1) {
    for (let i = 0; i < config.populationSize; i += 1) {
      let a = i
      let b = i
      let c = i
      while (a === i) a = Math.floor(random() * config.populationSize)
      while (b === i || b === a) b = Math.floor(random() * config.populationSize)
      while (c === i || c === a || c === b) c = Math.floor(random() * config.populationSize)

      const trial = population[i].slice()
      const forced = Math.floor(random() * dimension)
      for (let j = 0; j < dimension; j += 1) {
        if (j === forced || random() < config.crossoverProbability) {
          const mutated = population[a][j] + config.differentialWeight * (population[b][j] - population[c][j])
          trial[j] = Math.min(Math.max(mutated, lower[j]), upper[j])
        }
      }
      const trialFitness = objective(trial)
      if (trialFitness < fitness[i]) {
        population[i] = trial
        fitness[i] = trialFitness
        if (trialFitness < fitness[bestIndex]) bestIndex = i
      }
    }
  }

  return { point: population[bestIndex], value: fitness[bestIndex] }
}
