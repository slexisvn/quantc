import { registry, type OpRegistry } from '../op-registry'
import { binaryOp, unaryOp } from './factories'

export function registerTranscendental(target: OpRegistry = registry): void {
  target.register(unaryOp('exp', (a) => Math.exp(a), (_a, y, g) => g * y))
  target.register(unaryOp('log', (a) => Math.log(a), (a, _y, g) => g / a))
  target.register(unaryOp('sqrt', (a) => Math.sqrt(a), (_a, y, g) => g / (2 * y)))
  target.register(binaryOp('max', (a, b) => (a >= b ? a : b), (a, b, _y, g) => (a >= b ? [g, 0] : [0, g])))
  target.register(binaryOp('min', (a, b) => (a <= b ? a : b), (a, b, _y, g) => (a <= b ? [g, 0] : [0, g])))
  target.register(binaryOp('ge', (a, b) => (a >= b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
}
