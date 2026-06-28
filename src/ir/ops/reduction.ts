import { registry, type OpRegistry, type OpDef } from '../op-registry'

const meanOp: OpDef = {
  name: 'mean',
  arity: 1,
  inferKind: () => 'scalar',
  evalFn: (operands) => {
    const a = operands[0]
    let total = 0
    for (let i = 0; i < a.length; i += 1) total += a[i]
    return new Float64Array([total / a.length])
  },
  adjointFn: (operands, _result, adjOut) => {
    const a = operands[0]
    const grad = new Float64Array(a.length)
    const share = adjOut[0] / a.length
    for (let i = 0; i < a.length; i += 1) grad[i] = share
    return [grad]
  },
  jvpFn: (_operands, tangents) => {
    const da = tangents[0]
    let total = 0
    for (let i = 0; i < da.length; i += 1) total += da[i]
    return new Float64Array([total / da.length])
  },
}

const sumOp: OpDef = {
  name: 'sum',
  arity: 1,
  inferKind: () => 'scalar',
  evalFn: (operands) => {
    const a = operands[0]
    let total = 0
    for (let i = 0; i < a.length; i += 1) total += a[i]
    return new Float64Array([total])
  },
  adjointFn: (operands, _result, adjOut) => {
    const a = operands[0]
    const grad = new Float64Array(a.length)
    const share = adjOut[0]
    for (let i = 0; i < a.length; i += 1) grad[i] = share
    return [grad]
  },
  jvpFn: (_operands, tangents) => {
    const da = tangents[0]
    let total = 0
    for (let i = 0; i < da.length; i += 1) total += da[i]
    return new Float64Array([total])
  },
}

export function registerReduction(target: OpRegistry = registry): void {
  target.register(meanOp)
  target.register(sumOp)
}
