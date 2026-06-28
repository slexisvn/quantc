import type { Expr, Product, EventDecl, Position } from './ast'

const ORIGIN: Position = { line: 0, col: 0 }

function num(value: number): Expr {
  return { kind: 'num', value, pos: ORIGIN }
}

function call(callee: string, args: Expr[]): Expr {
  return { kind: 'call', callee, args, pos: ORIGIN }
}

function binary(op: string, left: Expr, right: Expr): Expr {
  return { kind: 'binary', op, left, right, pos: ORIGIN }
}

export type Observable = (date: number, underlying: string) => Expr

export const konst = (value: number): Observable => () => num(value)
export const spot: Observable = (date, underlying) => call(underlying, [num(date)])
export const minus = (a: Observable, b: Observable): Observable => (date, underlying) => binary('-', a(date, underlying), b(date, underlying))
export const times = (a: Observable, b: Observable): Observable => (date, underlying) => binary('*', a(date, underlying), b(date, underlying))
export const maxObs = (a: Observable, b: Observable): Observable => (date, underlying) => call('max', [a(date, underlying), b(date, underlying)])

export type Contract =
  | { readonly kind: 'zero' }
  | { readonly kind: 'pay'; readonly date: number; readonly amount: Observable }
  | { readonly kind: 'and'; readonly left: Contract; readonly right: Contract }
  | { readonly kind: 'give'; readonly inner: Contract }
  | { readonly kind: 'scale'; readonly factor: number; readonly inner: Contract }

export const zero: Contract = { kind: 'zero' }

export function pay(date: number, amount: Observable): Contract {
  return { kind: 'pay', date, amount }
}

export function and(left: Contract, right: Contract): Contract {
  return { kind: 'and', left, right }
}

export function give(inner: Contract): Contract {
  return { kind: 'give', inner }
}

export function scale(factor: number, inner: Contract): Contract {
  return { kind: 'scale', factor, inner }
}

export function zeroCouponBond(date: number, notional: number): Contract {
  return pay(date, konst(notional))
}

export function europeanCall(date: number, strike: number): Contract {
  return pay(date, maxObs(minus(spot, konst(strike)), konst(0)))
}

export function europeanPut(date: number, strike: number): Contract {
  return pay(date, maxObs(minus(konst(strike), spot), konst(0)))
}

interface Cashflow {
  readonly date: number
  readonly amount: Observable
}

function collect(contract: Contract, multiplier: number): Cashflow[] {
  switch (contract.kind) {
    case 'zero':
      return []
    case 'pay': {
      const amount = contract.amount
      return [{ date: contract.date, amount: (date, underlying) => binary('*', num(multiplier), amount(date, underlying)) }]
    }
    case 'and':
      return [...collect(contract.left, multiplier), ...collect(contract.right, multiplier)]
    case 'give':
      return collect(contract.inner, -multiplier)
    case 'scale':
      return collect(contract.inner, multiplier * contract.factor)
  }
}

export function desugar(contract: Contract, underlying = 'S', model = 'gbm'): Product {
  const cashflows = collect(contract, 1)
  const events: EventDecl[] = cashflows.map((cashflow, i) => ({
    variable: `e${i}`,
    schedule: { kind: 'single', date: num(cashflow.date) },
    body: [{ kind: 'pay', amount: cashflow.amount(cashflow.date, underlying), date: num(cashflow.date), currency: null, pos: ORIGIN }],
    pos: ORIGIN,
  }))
  return { name: 'Contract', underlyings: [{ name: underlying, model, modelParams: [], pos: ORIGIN }], params: [], vars: [], events, pos: ORIGIN }
}
