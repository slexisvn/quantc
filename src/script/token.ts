export type TokenType = 'number' | 'ident' | 'op' | 'lparen' | 'rparen' | 'comma' | 'eof'

export interface Token {
  readonly type: TokenType
  readonly value: string
}
