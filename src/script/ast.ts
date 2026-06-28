export type Expr =
  | { readonly kind: 'num'; readonly value: number }
  | { readonly kind: 'ident'; readonly name: string }
  | { readonly kind: 'unary'; readonly op: string; readonly operand: Expr }
  | { readonly kind: 'binary'; readonly op: string; readonly left: Expr; readonly right: Expr }
  | { readonly kind: 'call'; readonly callee: string; readonly args: readonly Expr[] }
