import type { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import type { Expr } from './ast'

const CALL_ARITY: Readonly<Record<string, number>> = {
  max: 2,
  min: 2,
  exp: 1,
  log: 1,
  sqrt: 1,
  sigmoid: 1,
  softplus: 1,
}

export function lowerPayoff(expr: Expr, graph: Graph, environment: Map<string, Value>): Value {
  switch (expr.kind) {
    case 'num':
      return graph.constant(expr.value)
    case 'ident': {
      const value = environment.get(expr.name)
      if (value === undefined) throw new Error(`unknown identifier '${expr.name}'`)
      return value
    }
    case 'unary':
      return graph.neg(lowerPayoff(expr.operand, graph, environment))
    case 'binary':
      return graph.operator(expr.op, lowerPayoff(expr.left, graph, environment), lowerPayoff(expr.right, graph, environment))
    case 'call': {
      const arity = CALL_ARITY[expr.callee]
      if (arity === undefined) throw new Error(`unknown function '${expr.callee}'`)
      if (expr.args.length !== arity) throw new Error(`function '${expr.callee}' expects ${arity} arguments`)
      const args = expr.args.map((argument) => lowerPayoff(argument, graph, environment))
      return graph.emit(expr.callee, args, {}, expr.callee)
    }
  }
}
