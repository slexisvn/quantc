import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { Tape, ANumber, variable, constant, gradientOf } from '../aad/tape'

export interface TwinTrainingSet {
  readonly inputs: number[]
  readonly values: number[]
  readonly differentials: number[]
}

export interface MlpConfig {
  readonly hidden: number[]
  readonly seed: number
  readonly learningRate: number
  readonly epochs: number
  readonly differentialWeight: number
}

interface Layer {
  W: number[][]
  b: number[]
}

interface ALayer {
  readonly W: ANumber[][]
  readonly b: ANumber[]
}

export interface MlpResult {
  readonly lossHistory: number[]
  predict(x: number): { value: number; gradient: number }
}

function initialiseLayers(hidden: number[], seed: number): Layer[] {
  const dims = [1, ...hidden, 1]
  const generator = new MersenneTwister(seed)
  const layers: Layer[] = []
  for (let l = 1; l < dims.length; l += 1) {
    const fanIn = dims[l - 1]
    const scale = Math.sqrt(2 / fanIn)
    const W: number[][] = []
    for (let i = 0; i < dims[l]; i += 1) {
      const row: number[] = []
      for (let j = 0; j < fanIn; j += 1) row.push(scale * inverseNormalCdf(generator.nextDouble()))
      W.push(row)
    }
    layers.push({ W, b: new Array<number>(dims[l]).fill(0) })
  }
  return layers
}

function forwardValueGradient(layers: readonly Layer[], x: number): { value: number; gradient: number } {
  let activations = [x]
  let derivatives = [1]
  for (let l = 0; l < layers.length; l += 1) {
    const layer = layers[l]
    const isOutput = l === layers.length - 1
    const nextActivations: number[] = []
    const nextDerivatives: number[] = []
    for (let i = 0; i < layer.W.length; i += 1) {
      let z = layer.b[i]
      let dz = 0
      for (let j = 0; j < activations.length; j += 1) {
        z += layer.W[i][j] * activations[j]
        dz += layer.W[i][j] * derivatives[j]
      }
      if (isOutput) {
        nextActivations.push(z)
        nextDerivatives.push(dz)
      } else {
        nextActivations.push(Math.log1p(Math.exp(z)))
        const sigmoid = 1 / (1 + Math.exp(-z))
        nextDerivatives.push(sigmoid * dz)
      }
    }
    activations = nextActivations
    derivatives = nextDerivatives
  }
  return { value: activations[0], gradient: derivatives[0] }
}

export function trainTwinMlp(training: TwinTrainingSet, config: MlpConfig): MlpResult {
  const layers = initialiseLayers(config.hidden, config.seed)
  const sampleCount = training.inputs.length
  const lossHistory: number[] = []

  for (let epoch = 0; epoch < config.epochs; epoch += 1) {
    const tape = new Tape()
    const one = constant(tape, 1)
    const softplus = (z: ANumber): ANumber => z.exp().add(one).log()
    const sigmoid = (z: ANumber): ANumber => one.div(z.neg().exp().add(one))

    const aLayers: ALayer[] = layers.map((layer) => ({
      W: layer.W.map((row) => row.map((value) => variable(tape, value))),
      b: layer.b.map((value) => variable(tape, value)),
    }))

    let loss = constant(tape, 0)
    const weight = constant(tape, config.differentialWeight)
    for (let s = 0; s < sampleCount; s += 1) {
      let activations: ANumber[] = [constant(tape, training.inputs[s])]
      let derivatives: ANumber[] = [one]
      for (let l = 0; l < aLayers.length; l += 1) {
        const layer = aLayers[l]
        const isOutput = l === aLayers.length - 1
        const nextActivations: ANumber[] = []
        const nextDerivatives: ANumber[] = []
        for (let i = 0; i < layer.W.length; i += 1) {
          let z = layer.b[i]
          let dz = constant(tape, 0)
          for (let j = 0; j < activations.length; j += 1) {
            z = z.add(layer.W[i][j].mul(activations[j]))
            dz = dz.add(layer.W[i][j].mul(derivatives[j]))
          }
          if (isOutput) {
            nextActivations.push(z)
            nextDerivatives.push(dz)
          } else {
            nextActivations.push(softplus(z))
            nextDerivatives.push(sigmoid(z).mul(dz))
          }
        }
        activations = nextActivations
        derivatives = nextDerivatives
      }
      const valueError = activations[0].sub(constant(tape, training.values[s]))
      const gradientError = derivatives[0].sub(constant(tape, training.differentials[s]))
      loss = loss.add(valueError.mul(valueError)).add(weight.mul(gradientError.mul(gradientError)))
    }
    loss = loss.mul(constant(tape, 1 / sampleCount))
    lossHistory.push(loss.value)

    const variables: ANumber[] = []
    for (const layer of aLayers) {
      for (const row of layer.W) for (const value of row) variables.push(value)
      for (const value of layer.b) variables.push(value)
    }
    const gradients = gradientOf(tape, loss, variables)
    let cursor = 0
    for (const layer of layers) {
      for (const row of layer.W) for (let j = 0; j < row.length; j += 1) row[j] -= config.learningRate * gradients[cursor++]
      for (let i = 0; i < layer.b.length; i += 1) layer.b[i] -= config.learningRate * gradients[cursor++]
    }
  }

  return { lossHistory, predict: (x) => forwardValueGradient(layers, x) }
}
