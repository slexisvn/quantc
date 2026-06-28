export type Type = 'Number' | 'Bool'

export const ARITHMETIC_OPS = new Set(['+', '-', '*', '/'])
export const COMPARISON_OPS = new Set(['<', '<=', '>', '>=', '==', '!='])
export const LOGICAL_OPS = new Set(['and', 'or'])

export interface FunctionSignature {
  readonly args: Type[]
  readonly result: Type
}

export const FUNCTIONS: Readonly<Record<string, FunctionSignature>> = {
  max: { args: ['Number', 'Number'], result: 'Number' },
  min: { args: ['Number', 'Number'], result: 'Number' },
  exp: { args: ['Number'], result: 'Number' },
  log: { args: ['Number'], result: 'Number' },
  sqrt: { args: ['Number'], result: 'Number' },
  abs: { args: ['Number'], result: 'Number' },
}

export const PATH_FUNCTIONS = new Set(['runningMax', 'runningMin', 'average'])
