import type { Expr, Stmt, Product, Position } from './ast'
import { type Type, ARITHMETIC_OPS, COMPARISON_OPS, LOGICAL_OPS, FUNCTIONS, PATH_FUNCTIONS } from './types'
import { isModel, modelParams } from './models'

export interface TypeError {
  readonly message: string
  readonly line: number
  readonly col: number
}

interface Scope {
  readonly underlyings: Set<string>
  readonly bindings: Map<string, Type>
}

class Checker {
  readonly errors: TypeError[] = []

  constructor(private readonly scope: Scope) {}

  private report(message: string, pos: Position): void {
    this.errors.push({ message, line: pos.line, col: pos.col })
  }

  checkExpr(expr: Expr): Type {
    switch (expr.kind) {
      case 'num':
        return 'Number'
      case 'ident': {
        if (this.scope.underlyings.has(expr.name)) {
          this.report(`underlying '${expr.name}' must be observed as ${expr.name}(t)`, expr.pos)
          return 'Number'
        }
        const type = this.scope.bindings.get(expr.name)
        if (type === undefined) {
          this.report(`undeclared identifier '${expr.name}'`, expr.pos)
          return 'Number'
        }
        return type
      }
      case 'unary': {
        const operand = this.checkExpr(expr.operand)
        if (expr.op === 'not') {
          if (operand !== 'Bool') this.report('operator not expects Bool', expr.pos)
          return 'Bool'
        }
        if (operand !== 'Number') this.report('unary minus expects Number', expr.pos)
        return 'Number'
      }
      case 'binary': {
        const left = this.checkExpr(expr.left)
        const right = this.checkExpr(expr.right)
        if (ARITHMETIC_OPS.has(expr.op)) {
          if (left !== 'Number' || right !== 'Number') this.report(`operator ${expr.op} expects Number operands`, expr.pos)
          return 'Number'
        }
        if (COMPARISON_OPS.has(expr.op)) {
          if (left !== 'Number' || right !== 'Number') this.report(`comparison ${expr.op} expects Number operands`, expr.pos)
          return 'Bool'
        }
        if (LOGICAL_OPS.has(expr.op)) {
          if (left !== 'Bool' || right !== 'Bool') this.report(`operator ${expr.op} expects Bool operands`, expr.pos)
          return 'Bool'
        }
        this.report(`unknown operator ${expr.op}`, expr.pos)
        return 'Number'
      }
      case 'ternary': {
        if (this.checkExpr(expr.cond) !== 'Bool') this.report('ternary condition must be Bool', expr.pos)
        const whenTrue = this.checkExpr(expr.whenTrue)
        const whenFalse = this.checkExpr(expr.whenFalse)
        if (whenTrue !== whenFalse) this.report('ternary branches must have the same type', expr.pos)
        return whenTrue
      }
      case 'call':
        return this.checkCall(expr)
      case 'let': {
        const valueType = this.checkExpr(expr.value)
        const previous = this.scope.bindings.get(expr.name)
        this.scope.bindings.set(expr.name, valueType)
        const bodyType = this.checkExpr(expr.body)
        if (previous === undefined) this.scope.bindings.delete(expr.name)
        else this.scope.bindings.set(expr.name, previous)
        return bodyType
      }
    }
  }

  private checkCall(expr: Extract<Expr, { kind: 'call' }>): Type {
    if (this.scope.underlyings.has(expr.callee)) {
      if (expr.args.length !== 1) this.report(`observable ${expr.callee}(t) takes one time argument`, expr.pos)
      else if (this.checkExpr(expr.args[0]) !== 'Number') this.report('observation time must be Number', expr.pos)
      return 'Number'
    }
    if (expr.callee === 'bond') {
      const underlying = expr.args[0]
      if (underlying === undefined || underlying.kind !== 'ident' || !this.scope.underlyings.has(underlying.name)) {
        this.report('bond expects a rate underlying as its first argument', expr.pos)
      }
      if (expr.args.length !== 2) this.report('bond(rate, maturity) takes two arguments', expr.pos)
      else if (this.checkExpr(expr.args[1]) !== 'Number') this.report('bond maturity must be Number', expr.pos)
      return 'Number'
    }
    if (PATH_FUNCTIONS.has(expr.callee)) {
      const underlying = expr.args[0]
      if (underlying === undefined || underlying.kind !== 'ident' || !this.scope.underlyings.has(underlying.name)) {
        this.report(`${expr.callee} expects an underlying as its first argument`, expr.pos)
      }
      for (let i = 1; i < expr.args.length; i += 1) {
        if (this.checkExpr(expr.args[i]) !== 'Number') this.report(`${expr.callee} time argument must be Number`, expr.pos)
      }
      return 'Number'
    }
    const signature = FUNCTIONS[expr.callee]
    if (signature === undefined) {
      this.report(`unknown function '${expr.callee}'`, expr.pos)
      return 'Number'
    }
    if (expr.args.length !== signature.args.length) this.report(`${expr.callee} expects ${signature.args.length} arguments`, expr.pos)
    expr.args.forEach((arg, i) => {
      const type = this.checkExpr(arg)
      if (signature.args[i] !== undefined && type !== signature.args[i]) this.report(`argument ${i + 1} of ${expr.callee} must be ${signature.args[i]}`, expr.pos)
    })
    return signature.result
  }

  checkStmt(stmt: Stmt): void {
    switch (stmt.kind) {
      case 'assign': {
        const type = this.checkExpr(stmt.expr)
        if (type !== 'Number') this.report(`assignment to '${stmt.name}' must be Number`, stmt.pos)
        if (stmt.declare) this.scope.bindings.set(stmt.name, 'Number')
        else if (!this.scope.bindings.has(stmt.name)) this.report(`assignment to undeclared variable '${stmt.name}'`, stmt.pos)
        return
      }
      case 'if': {
        if (this.checkExpr(stmt.cond) !== 'Bool') this.report('if condition must be Bool', stmt.pos)
        for (const inner of stmt.body) this.checkStmt(inner)
        if (stmt.otherwise !== null) for (const inner of stmt.otherwise) this.checkStmt(inner)
        return
      }
      case 'pay':
        if (this.checkExpr(stmt.amount) !== 'Number') this.report('pay amount must be Number', stmt.pos)
        if (this.checkExpr(stmt.date) !== 'Number') this.report('pay date must be Number', stmt.pos)
        if (stmt.currency !== null && !this.scope.underlyings.has(stmt.currency)) this.report(`pay currency '${stmt.currency}' must be an FX underlying`, stmt.pos)
        return
      case 'stop':
        return
      case 'exercise':
        for (const inner of stmt.body) this.checkStmt(inner)
        return
    }
  }
}

export function checkProduct(product: Product): TypeError[] {
  const underlyings = new Set(product.underlyings.map((u) => u.name))
  const bindings = new Map<string, Type>()
  for (const param of product.params) bindings.set(param.name, 'Number')
  for (const declaration of product.vars) bindings.set(declaration.name, 'Number')

  const errors: TypeError[] = []
  for (const underlying of product.underlyings) {
    if (!isModel(underlying.model)) {
      errors.push({ message: `unknown model '${underlying.model}'`, line: underlying.pos.line, col: underlying.pos.col })
      continue
    }
    const schema = modelParams(underlying.model)
    for (const param of underlying.modelParams) {
      if (!schema.includes(param.name)) errors.push({ message: `model '${underlying.model}' has no parameter '${param.name}'`, line: param.pos.line, col: param.pos.col })
    }
  }
  for (const event of product.events) {
    const scope: Scope = { underlyings, bindings: new Map(bindings) }
    scope.bindings.set(event.variable, 'Number')
    const checker = new Checker(scope)
    for (const stmt of event.body) checker.checkStmt(stmt)
    errors.push(...checker.errors)
  }
  return errors
}
