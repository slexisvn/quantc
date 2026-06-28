import type { OpDef } from '../op-registry'

export const constOp: OpDef = {
  name: 'const',
  arity: 0,
  inferKind: () => 'scalar',
  evalFn: (_operands, _outLen, attrs) => new Float64Array([attrs.value as number]),
  adjointFn: () => [],
  jvpFn: () => new Float64Array([0]),
}
