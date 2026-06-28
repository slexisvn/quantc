import { type Token, type TokenType, KEYWORDS } from './token'

const TWO_CHAR_OPS = new Set(['<=', '>=', '==', '!='])
const ONE_CHAR_OPS = new Set(['<', '>', '+', '-', '*', '/', '='])

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

function isIdentStart(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
}

function isIdentPart(c: string): boolean {
  return isIdentStart(c) || isDigit(c)
}

function isExponentSign(source: string, index: number): boolean {
  const c = source[index]
  if (c !== '+' && c !== '-') return false
  const previous = source[index - 1]
  return previous === 'e' || previous === 'E'
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let line = 1
  let col = 1
  const n = source.length

  const push = (type: TokenType, value: string, startCol: number): void => {
    tokens.push({ type, value, line, col: startCol })
  }

  while (i < n) {
    const c = source[i]
    if (c === '\n') {
      line += 1
      col = 1
      i += 1
      continue
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i += 1
      col += 1
      continue
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < n && source[i] !== '\n') i += 1
      continue
    }

    const startCol = col
    if (c === '(') { push('lparen', c, startCol); i += 1; col += 1; continue }
    if (c === ')') { push('rparen', c, startCol); i += 1; col += 1; continue }
    if (c === '{') { push('lbrace', c, startCol); i += 1; col += 1; continue }
    if (c === '}') { push('rbrace', c, startCol); i += 1; col += 1; continue }
    if (c === ',') { push('comma', c, startCol); i += 1; col += 1; continue }
    if (c === '?') { push('question', c, startCol); i += 1; col += 1; continue }
    if (c === ':') { push('colon', c, startCol); i += 1; col += 1; continue }

    const twoChar = source.slice(i, i + 2)
    if (TWO_CHAR_OPS.has(twoChar)) { push('op', twoChar, startCol); i += 2; col += 2; continue }
    if (ONE_CHAR_OPS.has(c)) { push('op', c, startCol); i += 1; col += 1; continue }

    if (isDigit(c) || (c === '.' && isDigit(source[i + 1]))) {
      let j = i + 1
      while (j < n && (isDigit(source[j]) || source[j] === '.' || source[j] === 'e' || source[j] === 'E' || isExponentSign(source, j))) j += 1
      push('number', source.slice(i, j), startCol)
      col += j - i
      i = j
      continue
    }

    if (isIdentStart(c)) {
      let j = i + 1
      while (j < n && isIdentPart(source[j])) j += 1
      const text = source.slice(i, j)
      push(KEYWORDS.has(text) ? 'keyword' : 'ident', text, startCol)
      col += j - i
      i = j
      continue
    }

    throw new Error(`unexpected character '${c}' at ${line}:${col}`)
  }

  tokens.push({ type: 'eof', value: '', line, col })
  return tokens
}
