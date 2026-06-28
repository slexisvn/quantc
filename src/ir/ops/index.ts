import { registry } from '../op-registry'
import { constOp } from './core'
import { registerArithmetic } from './arithmetic'
import { registerTranscendental } from './transcendental'
import { registerReduction } from './reduction'
import { registerSmoothing } from './smoothing'
import { registerComparison } from './comparison'

let registered = false

export function registerBuiltinOps(): void {
  if (registered) return
  registry.register(constOp)
  registerArithmetic(registry)
  registerTranscendental(registry)
  registerReduction(registry)
  registerSmoothing(registry)
  registerComparison(registry)
  registered = true
}
