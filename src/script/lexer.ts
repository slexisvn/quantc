import type { Token } from './token'

const OPERATORS = new Set(['+', '-', '*', '/'])

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
  const n = source.length

  while (i < n) {
    const c = source[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i += 1
      continue
    }
    if (c === '(') {
      tokens.push({ type: 'lparen', value: c })
      i += 1
      continue
    }
    if (c === ')') {
      tokens.push({ type: 'rparen', value: c })
      i += 1
      continue
    }
    if (c === ',') {
      tokens.push({ type: 'comma', value: c })
      i += 1
      continue
    }
    if (OPERATORS.has(c)) {
      tokens.push({ type: 'op', value: c })
      i += 1
      continue
    }
    if (isDigit(c) || c === '.') {
      let j = i + 1
      while (j < n && (isDigit(source[j]) || source[j] === '.' || source[j] === 'e' || source[j] === 'E' || isExponentSign(source, j))) j += 1
      tokens.push({ type: 'number', value: source.slice(i, j) })
      i = j
      continue
    }
    if (isIdentStart(c)) {
      let j = i + 1
      while (j < n && isIdentPart(source[j])) j += 1
      tokens.push({ type: 'ident', value: source.slice(i, j) })
      i = j
      continue
    }
    throw new Error(`unexpected character '${c}'`)
  }

  tokens.push({ type: 'eof', value: '' })
  return tokens
}
