import { registry, type OpRegistry } from '../op-registry'
import { binaryOp, unaryOp } from './factories'

export function registerArithmetic(target: OpRegistry = registry): void {
  target.register(binaryOp('add', (a, b) => a + b, (_a, _b, _y, g) => [g, g]))
  target.register(binaryOp('sub', (a, b) => a - b, (_a, _b, _y, g) => [g, -g]))
  target.register(binaryOp('mul', (a, b) => a * b, (a, b, _y, g) => [g * b, g * a]))
  target.register(binaryOp('div', (a, b) => a / b, (a, b, _y, g) => [g / b, (-g * a) / (b * b)]))
  target.register(unaryOp('neg', (a) => -a, (_a, _y, g) => -g))
}
