import { tokenize } from './lexer'
import type { Token, TokenType } from './token'
import type { Expr } from './ast'

const INFIX_PRECEDENCE: Readonly<Record<string, number>> = {
  '+': 10,
  '-': 10,
  '*': 20,
  '/': 20,
}

const UNARY_PRECEDENCE = 30

class Parser {
  private position = 0

  constructor(private readonly tokens: readonly Token[]) {}

  private peek(): Token {
    return this.tokens[this.position]
  }

  private advance(): Token {
    const token = this.tokens[this.position]
    this.position += 1
    return token
  }

  expect(type: TokenType): Token {
    const token = this.advance()
    if (token.type !== type) throw new Error(`expected ${type}, found ${token.type}`)
    return token
  }

  parseExpression(minPrecedence: number): Expr {
    let left = this.parsePrefix()
    for (;;) {
      const token = this.peek()
      if (token.type !== 'op') break
      const precedence = INFIX_PRECEDENCE[token.value]
      if (precedence === undefined || precedence < minPrecedence) break
      this.advance()
      const right = this.parseExpression(precedence + 1)
      left = { kind: 'binary', op: token.value, left, right }
    }
    return left
  }

  private parsePrefix(): Expr {
    const token = this.peek()
    if (token.type === 'op' && token.value === '-') {
      this.advance()
      return { kind: 'unary', op: '-', operand: this.parseExpression(UNARY_PRECEDENCE) }
    }
    if (token.type === 'number') {
      this.advance()
      return { kind: 'num', value: Number(token.value) }
    }
    if (token.type === 'ident') {
      this.advance()
      if (this.peek().type === 'lparen') {
        this.advance()
        const args: Expr[] = []
        if (this.peek().type !== 'rparen') {
          args.push(this.parseExpression(0))
          while (this.peek().type === 'comma') {
            this.advance()
            args.push(this.parseExpression(0))
          }
        }
        this.expect('rparen')
        return { kind: 'call', callee: token.value, args }
      }
      return { kind: 'ident', name: token.value }
    }
    if (token.type === 'lparen') {
      this.advance()
      const inner = this.parseExpression(0)
      this.expect('rparen')
      return inner
    }
    throw new Error(`unexpected token ${token.type}`)
  }
}

export function parsePayoff(source: string): Expr {
  const parser = new Parser(tokenize(source))
  const expression = parser.parseExpression(0)
  parser.expect('eof')
  return expression
}
