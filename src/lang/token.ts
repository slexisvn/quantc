export type TokenType =
  | 'number'
  | 'ident'
  | 'keyword'
  | 'op'
  | 'lparen'
  | 'rparen'
  | 'lbrace'
  | 'rbrace'
  | 'comma'
  | 'question'
  | 'colon'
  | 'eof'

export interface Token {
  readonly type: TokenType
  readonly value: string
  readonly line: number
  readonly col: number
}

export const KEYWORDS = new Set([
  'product',
  'underlying',
  'model',
  'param',
  'var',
  'event',
  'in',
  'schedule',
  'if',
  'then',
  'else',
  'pay',
  'at',
  'stop',
  'let',
  'exercise',
  'and',
  'or',
  'not',
])
