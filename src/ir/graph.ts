import { Value } from './value'
import { Node } from './node'
import { registry } from './op-registry'
import type { Attr, ValueKind } from './types'

const OPERATOR_OPS: Readonly<Record<string, string>> = {
  '+': 'add',
  '-': 'sub',
  '*': 'mul',
  '/': 'div',
}

export class Graph {
  readonly inputs: Value[] = []
  readonly nodes: Node[] = []
  output: Value | null = null
  private valueSeq = 0
  private nodeSeq = 0

  input(kind: ValueKind, label: string): Value {
    const value = new Value(this.valueSeq, kind, label)
    this.valueSeq += 1
    this.inputs.push(value)
    return value
  }

  emit(op: string, operands: readonly Value[], attrs: Attr, label: string): Value {
    const definition = registry.get(op)
    if (definition.arity >= 0 && operands.length !== definition.arity) {
      throw new Error(`op ${op} expects ${definition.arity} operands, received ${operands.length}`)
    }
    const kind = definition.inferKind(operands.map((operand) => operand.kind), attrs)
    const result = new Value(this.valueSeq, kind, label)
    this.valueSeq += 1
    const node = new Node(this.nodeSeq, op, [...operands], result, attrs)
    this.nodeSeq += 1
    result.producer = node
    for (let i = 0; i < operands.length; i += 1) operands[i].uses.push({ node, index: i })
    this.nodes.push(node)
    return result
  }

  constant(value: number): Value {
    return this.emit('const', [], { value }, `const_${value}`)
  }

  operator(symbol: string, left: Value, right: Value): Value {
    const op = OPERATOR_OPS[symbol]
    if (op === undefined) throw new Error(`unknown operator ${symbol}`)
    return this.emit(op, [left, right], {}, op)
  }

  add(left: Value, right: Value): Value {
    return this.emit('add', [left, right], {}, 'add')
  }

  sub(left: Value, right: Value): Value {
    return this.emit('sub', [left, right], {}, 'sub')
  }

  mul(left: Value, right: Value): Value {
    return this.emit('mul', [left, right], {}, 'mul')
  }

  div(left: Value, right: Value): Value {
    return this.emit('div', [left, right], {}, 'div')
  }

  neg(operand: Value): Value {
    return this.emit('neg', [operand], {}, 'neg')
  }

  exp(operand: Value): Value {
    return this.emit('exp', [operand], {}, 'exp')
  }

  log(operand: Value): Value {
    return this.emit('log', [operand], {}, 'log')
  }

  sqrt(operand: Value): Value {
    return this.emit('sqrt', [operand], {}, 'sqrt')
  }

  max(left: Value, right: Value): Value {
    return this.emit('max', [left, right], {}, 'max')
  }

  min(left: Value, right: Value): Value {
    return this.emit('min', [left, right], {}, 'min')
  }

  sigmoid(operand: Value): Value {
    return this.emit('sigmoid', [operand], {}, 'sigmoid')
  }

  softplus(operand: Value): Value {
    return this.emit('softplus', [operand], {}, 'softplus')
  }

  mean(operand: Value): Value {
    return this.emit('mean', [operand], {}, 'mean')
  }

  sum(operand: Value): Value {
    return this.emit('sum', [operand], {}, 'sum')
  }
}
