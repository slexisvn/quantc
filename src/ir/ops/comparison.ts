import { registry, type OpRegistry } from '../op-registry'
import { binaryOp, unaryOp } from './factories'

export function registerComparison(target: OpRegistry = registry): void {
  target.register(binaryOp('lt', (a, b) => (a < b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
  target.register(binaryOp('le', (a, b) => (a <= b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
  target.register(binaryOp('gt', (a, b) => (a > b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
  target.register(binaryOp('eq', (a, b) => (a === b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
  target.register(binaryOp('ne', (a, b) => (a !== b ? 1 : 0), (_a, _b, _y, _g) => [0, 0]))
  target.register(unaryOp('abs', (a) => Math.abs(a), (a, _y, g) => g * Math.sign(a)))
}
