import { describe, it, expect } from 'vitest'
import { trainTwinMlp, type TwinTrainingSet, type MlpConfig } from '../../src/proxy/mlp'

function quadraticTrainingSet(count: number): TwinTrainingSet {
  const inputs: number[] = []
  const values: number[] = []
  const differentials: number[] = []
  for (let i = 0; i < count; i += 1) {
    const x = -1 + (2 * i) / (count - 1)
    inputs.push(x)
    values.push(x * x)
    differentials.push(2 * x)
  }
  return { inputs, values, differentials }
}

const config: MlpConfig = { hidden: [8, 8], seed: 17, learningRate: 0.05, epochs: 40, differentialWeight: 1 }

describe('twin-network MLP', () => {
  const training = quadraticTrainingSet(48)

  it('reduces the twin loss over training epochs', () => {
    const result = trainTwinMlp(training, config)
    expect(result.lossHistory[result.lossHistory.length - 1]).toBeLessThan(result.lossHistory[0])
  })

  it('is deterministic given the seed', () => {
    const first = trainTwinMlp(training, config)
    const second = trainTwinMlp(training, config)
    expect(first.lossHistory).toEqual(second.lossHistory)
    expect(first.predict(0.3).value).toBe(second.predict(0.3).value)
  })
})
