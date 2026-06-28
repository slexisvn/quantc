export interface Position {
  readonly line: number
  readonly col: number
}

export type Expr =
  | { readonly kind: 'num'; readonly value: number; readonly pos: Position }
  | { readonly kind: 'ident'; readonly name: string; readonly pos: Position }
  | { readonly kind: 'unary'; readonly op: string; readonly operand: Expr; readonly pos: Position }
  | { readonly kind: 'binary'; readonly op: string; readonly left: Expr; readonly right: Expr; readonly pos: Position }
  | { readonly kind: 'ternary'; readonly cond: Expr; readonly whenTrue: Expr; readonly whenFalse: Expr; readonly pos: Position }
  | { readonly kind: 'call'; readonly callee: string; readonly args: readonly Expr[]; readonly pos: Position }

export type Stmt =
  | { readonly kind: 'assign'; readonly name: string; readonly expr: Expr; readonly declare: boolean; readonly pos: Position }
  | { readonly kind: 'if'; readonly cond: Expr; readonly body: Stmt[]; readonly otherwise: Stmt[] | null; readonly pos: Position }
  | { readonly kind: 'pay'; readonly amount: Expr; readonly date: Expr; readonly pos: Position }
  | { readonly kind: 'stop'; readonly pos: Position }
  | { readonly kind: 'exercise'; readonly name: string; readonly body: Stmt[]; readonly pos: Position }

export type EventSchedule =
  | { readonly kind: 'single'; readonly date: Expr }
  | { readonly kind: 'schedule'; readonly start: Expr; readonly end: Expr; readonly step: Expr }

export interface Underlying {
  readonly name: string
  readonly model: string
  readonly pos: Position
}

export interface ParamDecl {
  readonly name: string
  readonly value: Expr
  readonly pos: Position
}

export interface VarDecl {
  readonly name: string
  readonly init: Expr
  readonly pos: Position
}

export interface EventDecl {
  readonly variable: string
  readonly schedule: EventSchedule
  readonly body: Stmt[]
  readonly pos: Position
}

export interface Product {
  readonly name: string
  readonly underlyings: Underlying[]
  readonly params: ParamDecl[]
  readonly vars: VarDecl[]
  readonly events: EventDecl[]
  readonly pos: Position
}
