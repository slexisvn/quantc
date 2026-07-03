import { tokenize } from './lexer'
import type { Token, TokenType } from './token'
import type { Expr, Stmt, Product, Underlying, ModelParam, ParamDecl, VarDecl, EventDecl, EventSchedule, Position } from './ast'

const INFIX_PRECEDENCE: Readonly<Record<string, number>> = {
  or: 10,
  and: 20,
  '==': 30,
  '!=': 30,
  '<': 40,
  '<=': 40,
  '>': 40,
  '>=': 40,
  '+': 50,
  '-': 50,
  '*': 60,
  '/': 60,
}

class Parser {
  private index = 0

  constructor(private readonly tokens: readonly Token[]) {}

  private peek(): Token {
    return this.tokens[this.index]
  }

  private advance(): Token {
    const token = this.tokens[this.index]
    this.index += 1
    return token
  }

  private position(): Position {
    const token = this.peek()
    return { line: token.line, col: token.col }
  }

  private fail(message: string): never {
    const token = this.peek()
    throw new Error(`${message} at ${token.line}:${token.col} (found '${token.value || token.type}')`)
  }

  private expect(type: TokenType): Token {
    if (this.peek().type !== type) this.fail(`expected ${type}`)
    return this.advance()
  }

  private expectKeyword(value: string): void {
    const token = this.peek()
    if (token.type !== 'keyword' || token.value !== value) this.fail(`expected '${value}'`)
    this.advance()
  }

  private isKeyword(value: string): boolean {
    const token = this.peek()
    return token.type === 'keyword' && token.value === value
  }

  parseProduct(): Product {
    const pos = this.position()
    this.expectKeyword('product')
    const name = this.expect('ident').value
    this.expect('lbrace')

    const underlyings: Underlying[] = []
    const params: ParamDecl[] = []
    const vars: VarDecl[] = []
    const events: EventDecl[] = []

    while (this.peek().type !== 'rbrace') {
      if (this.isKeyword('underlying')) underlyings.push(this.parseUnderlying())
      else if (this.isKeyword('param')) params.push(this.parseParam())
      else if (this.isKeyword('var')) vars.push(this.parseVarDecl())
      else if (this.isKeyword('event')) events.push(this.parseEvent())
      else this.fail('expected declaration or event')
    }
    this.expect('rbrace')
    this.expect('eof')
    return { name, underlyings, params, vars, events, pos }
  }

  private parseUnderlying(): Underlying {
    const pos = this.position()
    this.expectKeyword('underlying')
    const name = this.expect('ident').value
    this.expectKeyword('model')
    const model = this.expect('ident').value
    let modelParams: ModelParam[] = []
    if (this.peek().type === 'lparen') {
      this.advance()
      modelParams = this.parseCommaSeparated(() => this.parseModelParam())
    }
    return { name, model, modelParams, pos }
  }

  private parseCommaSeparated<T>(parseItem: () => T): T[] {
    const items: T[] = []
    if (this.peek().type !== 'rparen') {
      items.push(parseItem())
      while (this.peek().type === 'comma') {
        this.advance()
        items.push(parseItem())
      }
    }
    this.expect('rparen')
    return items
  }

  private parseModelParam(): ModelParam {
    const pos = this.position()
    const name = this.expect('ident').value
    this.expectOperator('=')
    return { name, value: this.parseExpression(), pos }
  }

  private parseParam(): ParamDecl {
    const pos = this.position()
    this.expectKeyword('param')
    const name = this.expect('ident').value
    this.expectOperator('=')
    return { name, value: this.parseExpression(), pos }
  }

  private parseVarDecl(): VarDecl {
    const pos = this.position()
    this.expectKeyword('var')
    const name = this.expect('ident').value
    this.expectOperator('=')
    return { name, init: this.parseExpression(), pos }
  }

  private parseEvent(): EventDecl {
    const pos = this.position()
    this.expectKeyword('event')
    const variable = this.expect('ident').value
    let schedule: EventSchedule
    if (this.isKeyword('in')) {
      this.advance()
      this.expectKeyword('schedule')
      this.expect('lparen')
      const start = this.parseExpression()
      this.expect('comma')
      const end = this.parseExpression()
      this.expect('comma')
      const step = this.parseExpression()
      this.expect('rparen')
      schedule = { kind: 'schedule', start, end, step }
    } else {
      this.expectOperator('=')
      schedule = { kind: 'single', date: this.parseExpression() }
    }
    const body = this.parseBlock()
    return { variable, schedule, body, pos }
  }

  private parseBlock(): Stmt[] {
    this.expect('lbrace')
    const statements: Stmt[] = []
    while (this.peek().type !== 'rbrace') statements.push(this.parseStatement())
    this.expect('rbrace')
    return statements
  }

  private parseStatement(): Stmt {
    const pos = this.position()
    if (this.isKeyword('var')) {
      this.advance()
      const name = this.expect('ident').value
      this.expectOperator('=')
      return { kind: 'assign', name, expr: this.parseExpression(), declare: true, pos }
    }
    if (this.isKeyword('if')) {
      this.advance()
      const cond = this.parseExpression()
      this.expectKeyword('then')
      const body = this.parseBlock()
      let otherwise: Stmt[] | null = null
      if (this.isKeyword('else')) {
        this.advance()
        otherwise = this.parseBlock()
      }
      return { kind: 'if', cond, body, otherwise, pos }
    }
    if (this.isKeyword('pay')) {
      this.advance()
      const amount = this.parseExpression()
      let currency: string | null = null
      if (this.isKeyword('in')) {
        this.advance()
        currency = this.expect('ident').value
      }
      this.expectKeyword('at')
      return { kind: 'pay', amount, date: this.parseExpression(), currency, pos }
    }
    if (this.isKeyword('stop')) {
      this.advance()
      return { kind: 'stop', pos }
    }
    if (this.isKeyword('exercise')) {
      this.advance()
      const name = this.expect('ident').value
      return { kind: 'exercise', name, body: this.parseBlock(), pos }
    }
    if (this.peek().type === 'ident') {
      const name = this.advance().value
      this.expectOperator('=')
      return { kind: 'assign', name, expr: this.parseExpression(), declare: false, pos }
    }
    this.fail('expected statement')
  }

  private expectOperator(value: string): void {
    const token = this.peek()
    if (token.type !== 'op' || token.value !== value) this.fail(`expected '${value}'`)
    this.advance()
  }

  parseExpression(): Expr {
    if (this.isKeyword('let')) {
      const pos = this.position()
      this.advance()
      const name = this.expect('ident').value
      this.expectOperator('=')
      const value = this.parseExpression()
      this.expectKeyword('in')
      const body = this.parseExpression()
      return { kind: 'let', name, value, body, pos }
    }
    const cond = this.parseBinary(0)
    if (this.peek().type === 'question') {
      const pos = this.position()
      this.advance()
      const whenTrue = this.parseExpression()
      this.expect('colon')
      const whenFalse = this.parseExpression()
      return { kind: 'ternary', cond, whenTrue, whenFalse, pos }
    }
    return cond
  }

  private operatorOf(token: Token): string | null {
    if (token.type === 'op') return token.value
    if (token.type === 'keyword' && (token.value === 'and' || token.value === 'or')) return token.value
    return null
  }

  private parseBinary(minPrecedence: number): Expr {
    let left = this.parseUnary()
    for (;;) {
      const op = this.operatorOf(this.peek())
      if (op === null) break
      const precedence = INFIX_PRECEDENCE[op]
      if (precedence === undefined || precedence < minPrecedence) break
      const pos = this.position()
      this.advance()
      const right = this.parseBinary(precedence + 1)
      left = { kind: 'binary', op, left, right, pos }
    }
    return left
  }

  private parseUnary(): Expr {
    const token = this.peek()
    if (token.type === 'op' && token.value === '-') {
      const pos = this.position()
      this.advance()
      return { kind: 'unary', op: '-', operand: this.parseUnary(), pos }
    }
    if (token.type === 'keyword' && token.value === 'not') {
      const pos = this.position()
      this.advance()
      return { kind: 'unary', op: 'not', operand: this.parseUnary(), pos }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): Expr {
    const token = this.peek()
    const pos = this.position()
    if (token.type === 'number') {
      this.advance()
      return { kind: 'num', value: Number(token.value), pos }
    }
    if (token.type === 'ident') {
      this.advance()
      if (this.peek().type === 'lparen') {
        this.advance()
        const args = this.parseCommaSeparated(() => this.parseExpression())
        return { kind: 'call', callee: token.value, args, pos }
      }
      return { kind: 'ident', name: token.value, pos }
    }
    if (token.type === 'lparen') {
      this.advance()
      const inner = this.parseExpression()
      this.expect('rparen')
      return inner
    }
    this.fail('expected expression')
  }
}

export function parseProduct(source: string): Product {
  return new Parser(tokenize(source)).parseProduct()
}
