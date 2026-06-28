import type { Expr, Stmt, Product, EventDecl } from './ast'

function printExpr(expr: Expr): string {
  switch (expr.kind) {
    case 'num':
      return String(expr.value)
    case 'ident':
      return expr.name
    case 'unary':
      return expr.op === 'not' ? `(not ${printExpr(expr.operand)})` : `(-${printExpr(expr.operand)})`
    case 'binary':
      return `(${printExpr(expr.left)} ${expr.op} ${printExpr(expr.right)})`
    case 'ternary':
      return `(${printExpr(expr.cond)} ? ${printExpr(expr.whenTrue)} : ${printExpr(expr.whenFalse)})`
    case 'call':
      return `${expr.callee}(${expr.args.map(printExpr).join(', ')})`
  }
}

function indent(depth: number): string {
  return '  '.repeat(depth)
}

function printStmt(stmt: Stmt, depth: number): string {
  const pad = indent(depth)
  switch (stmt.kind) {
    case 'assign':
      return `${pad}${stmt.declare ? 'var ' : ''}${stmt.name} = ${printExpr(stmt.expr)}`
    case 'pay':
      return `${pad}pay ${printExpr(stmt.amount)} at ${printExpr(stmt.date)}`
    case 'stop':
      return `${pad}stop`
    case 'if': {
      const head = `${pad}if ${printExpr(stmt.cond)} then {\n${printBlock(stmt.body, depth + 1)}\n${pad}}`
      if (stmt.otherwise === null) return head
      return `${head} else {\n${printBlock(stmt.otherwise, depth + 1)}\n${pad}}`
    }
    case 'exercise':
      return `${pad}exercise ${stmt.name} {\n${printBlock(stmt.body, depth + 1)}\n${pad}}`
  }
}

function printBlock(body: Stmt[], depth: number): string {
  return body.map((stmt) => printStmt(stmt, depth)).join('\n')
}

function printEvent(event: EventDecl, depth: number): string {
  const pad = indent(depth)
  const header =
    event.schedule.kind === 'single'
      ? `event ${event.variable} = ${printExpr(event.schedule.date)}`
      : `event ${event.variable} in schedule(${printExpr(event.schedule.start)}, ${printExpr(event.schedule.end)}, ${printExpr(event.schedule.step)})`
  return `${pad}${header} {\n${printBlock(event.body, depth + 1)}\n${pad}}`
}

export function printProduct(product: Product): string {
  const lines: string[] = [`product ${product.name} {`]
  for (const underlying of product.underlyings) lines.push(`${indent(1)}underlying ${underlying.name} model ${underlying.model}`)
  for (const param of product.params) lines.push(`${indent(1)}param ${param.name} = ${printExpr(param.value)}`)
  for (const declaration of product.vars) lines.push(`${indent(1)}var ${declaration.name} = ${printExpr(declaration.init)}`)
  for (const event of product.events) lines.push(printEvent(event, 1))
  lines.push('}')
  return lines.join('\n')
}
