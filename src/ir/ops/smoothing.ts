import { registry, type OpRegistry } from '../op-registry'
import { unaryOp } from './factories'

function sigmoid(x: number): number {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x))
}

function softplus(x: number): number {
  return x > 0 ? x + Math.log1p(Math.exp(-x)) : Math.log1p(Math.exp(x))
}

export function registerSmoothing(target: OpRegistry = registry): void {
  target.register(unaryOp('sigmoid', sigmoid, (_a, y, g) => g * y * (1 - y)))
  target.register(unaryOp('softplus', softplus, (a, _y, g) => g * sigmoid(a)))
}
