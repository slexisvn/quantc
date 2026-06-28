import { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { registerBuiltinOps } from '../ir/ops/index'
import { runMonteCarlo } from '../engines/mc-core'
import { evaluate } from '../eval/interpreter'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { standardNormals } from '../numerics/sampling'
import type { Expr, Stmt, Product, EventDecl } from './ast'

const SEED_STRIDE = 2654435761

interface ExerciseRecord {
  readonly date: number
  readonly intrinsic: Value
  readonly underlying: Value
  readonly mask: Value
}

interface Fixing {
  readonly time: number
  readonly value: Value
}

interface ExprContext {
  readonly graph: Graph
  readonly env: Map<string, Value>
  readonly spot: Value
  readonly rate: Value
  readonly underlying: string
  readonly eventVar: string
  readonly eventTime: number
  readonly timeValue: Value
  readonly fixings: Fixing[]
  readonly paramDefaults: Map<string, number>
}

interface StmtContext extends ExprContext {
  condition: Value
  readonly alive: { value: Value }
  readonly cashflow: { value: Value }
  readonly exercises: ExerciseRecord[]
}

export interface CompiledProduct {
  readonly graph: Graph
  readonly spot: Value
  readonly rate: Value
  readonly vol: Value
  readonly params: Map<string, Value>
  readonly paramDefaults: Map<string, number>
  readonly normals: Value[]
  readonly times: number[]
  readonly price: Value
  readonly cashflow: Value
  readonly riskFactors: Value[]
  readonly exercises: ExerciseRecord[]
}

function evalConst(expr: Expr, params: Map<string, number>): number {
  switch (expr.kind) {
    case 'num':
      return expr.value
    case 'ident': {
      const value = params.get(expr.name)
      if (value === undefined) throw new Error(`'${expr.name}' is not a constant`)
      return value
    }
    case 'unary':
      return expr.op === '-' ? -evalConst(expr.operand, params) : evalConst(expr.operand, params)
    case 'binary': {
      const left = evalConst(expr.left, params)
      const right = evalConst(expr.right, params)
      if (expr.op === '+') return left + right
      if (expr.op === '-') return left - right
      if (expr.op === '*') return left * right
      if (expr.op === '/') return left / right
      throw new Error(`operator ${expr.op} is not constant`)
    }
    default:
      throw new Error('expected a constant expression')
  }
}

function computeParamDefaults(product: Product): Map<string, number> {
  const defaults = new Map<string, number>()
  for (const param of product.params) defaults.set(param.name, evalConst(param.value, defaults))
  return defaults
}

interface EventInstance {
  readonly body: Stmt[]
  readonly variable: string
  readonly time: number
}

function expandEvents(product: Product, defaults: Map<string, number>): EventInstance[] {
  const instances: EventInstance[] = []
  for (const event of product.events) instances.push(...expandEvent(event, defaults))
  return instances.sort((a, b) => a.time - b.time)
}

function expandEvent(event: EventDecl, defaults: Map<string, number>): EventInstance[] {
  if (event.schedule.kind === 'single') return [{ body: event.body, variable: event.variable, time: evalConst(event.schedule.date, defaults) }]
  const start = evalConst(event.schedule.start, defaults)
  const end = evalConst(event.schedule.end, defaults)
  const step = evalConst(event.schedule.step, defaults)
  const instances: EventInstance[] = []
  const count = Math.round((end - start) / step)
  for (let i = 0; i <= count; i += 1) instances.push({ body: event.body, variable: event.variable, time: start + i * step })
  return instances
}

function buildPath(graph: Graph, spot: Value, rate: Value, vol: Value, times: number[]): { fixings: Fixing[]; normals: Value[] } {
  const fixings: Fixing[] = [{ time: 0, value: spot }]
  const normals: Value[] = []
  const half = graph.constant(0.5)
  const driftRate = graph.sub(rate, graph.mul(graph.mul(half, vol), vol))
  let logState = graph.log(spot)
  let previous = 0
  for (const time of times) {
    const dt = time - previous
    const z = graph.input('batch', `z_${time}`)
    normals.push(z)
    const drift = graph.mul(driftRate, graph.constant(dt))
    const diffusion = graph.mul(graph.mul(vol, graph.sqrt(graph.constant(dt))), z)
    logState = graph.add(graph.add(logState, drift), diffusion)
    fixings.push({ time, value: graph.exp(logState) })
    previous = time
  }
  return { fixings, normals }
}

function fixingAt(fixings: Fixing[], time: number): Value {
  for (const fixing of fixings) {
    if (Math.abs(fixing.time - time) < 1e-9) return fixing.value
  }
  throw new Error(`no observation available at time ${time}`)
}

function timeOf(expr: Expr, context: ExprContext): number {
  if (expr.kind === 'ident' && expr.name === context.eventVar) return context.eventTime
  return evalConst(expr, context.paramDefaults)
}

function blend(graph: Graph, condition: Value, whenTrue: Value, whenFalse: Value): Value {
  return graph.add(graph.mul(condition, whenTrue), graph.mul(graph.sub(graph.constant(1), condition), whenFalse))
}

const BINARY_OPS: Readonly<Record<string, string>> = {
  '+': 'add',
  '-': 'sub',
  '*': 'mul',
  '/': 'div',
  '<': 'lt',
  '<=': 'le',
  '>': 'gt',
  '>=': 'ge',
  '==': 'eq',
  '!=': 'ne',
}

function lowerExpr(expr: Expr, context: ExprContext): Value {
  const g = context.graph
  switch (expr.kind) {
    case 'num':
      return g.constant(expr.value)
    case 'ident': {
      if (expr.name === context.eventVar) return context.timeValue
      const value = context.env.get(expr.name)
      if (value === undefined) throw new Error(`unknown identifier '${expr.name}'`)
      return value
    }
    case 'unary': {
      const operand = lowerExpr(expr.operand, context)
      return expr.op === 'not' ? g.sub(g.constant(1), operand) : g.neg(operand)
    }
    case 'binary': {
      if (expr.op === 'and') return g.mul(lowerExpr(expr.left, context), lowerExpr(expr.right, context))
      if (expr.op === 'or') {
        const a = lowerExpr(expr.left, context)
        const b = lowerExpr(expr.right, context)
        return g.sub(g.add(a, b), g.mul(a, b))
      }
      const op = BINARY_OPS[expr.op]
      if (op === undefined) throw new Error(`unknown operator ${expr.op}`)
      return g.emit(op, [lowerExpr(expr.left, context), lowerExpr(expr.right, context)], {}, op)
    }
    case 'ternary': {
      const condition = lowerExpr(expr.cond, context)
      return blend(g, condition, lowerExpr(expr.whenTrue, context), lowerExpr(expr.whenFalse, context))
    }
    case 'call':
      return lowerCall(expr, context)
  }
}

function lowerCall(expr: Extract<Expr, { kind: 'call' }>, context: ExprContext): Value {
  const g = context.graph
  if (expr.callee === context.underlying) return fixingAt(context.fixings, timeOf(expr.args[0], context))
  if (expr.callee === 'runningMax' || expr.callee === 'runningMin') {
    const limit = expr.args.length > 1 ? timeOf(expr.args[1], context) : context.eventTime
    const relevant = context.fixings.filter((f) => f.time <= limit + 1e-9 && f.time > 0)
    let accumulator = relevant[0].value
    for (let i = 1; i < relevant.length; i += 1) accumulator = expr.callee === 'runningMax' ? g.max(accumulator, relevant[i].value) : g.min(accumulator, relevant[i].value)
    return accumulator
  }
  if (expr.callee === 'average') {
    const relevant = context.fixings.filter((f) => f.time <= context.eventTime + 1e-9 && f.time > 0)
    let sum = relevant[0].value
    for (let i = 1; i < relevant.length; i += 1) sum = g.add(sum, relevant[i].value)
    return g.mul(sum, g.constant(1 / relevant.length))
  }
  const args = expr.args.map((arg) => lowerExpr(arg, context))
  if (expr.callee === 'max') return g.max(args[0], args[1])
  if (expr.callee === 'min') return g.min(args[0], args[1])
  if (expr.callee === 'exp') return g.exp(args[0])
  if (expr.callee === 'log') return g.log(args[0])
  if (expr.callee === 'sqrt') return g.sqrt(args[0])
  if (expr.callee === 'abs') return g.emit('abs', [args[0]], {}, 'abs')
  throw new Error(`unknown function '${expr.callee}'`)
}

function lowerStmt(stmt: Stmt, context: StmtContext): void {
  const g = context.graph
  switch (stmt.kind) {
    case 'assign': {
      const value = lowerExpr(stmt.expr, context)
      const old = context.env.get(stmt.name) ?? g.constant(0)
      context.env.set(stmt.name, blend(g, context.condition, value, old))
      return
    }
    case 'if': {
      const indicator = lowerExpr(stmt.cond, context)
      const thenContext: StmtContext = { ...context, condition: g.mul(context.condition, indicator) }
      for (const inner of stmt.body) lowerStmt(inner, thenContext)
      if (stmt.otherwise !== null) {
        const elseContext: StmtContext = { ...context, condition: g.mul(context.condition, g.sub(g.constant(1), indicator)) }
        for (const inner of stmt.otherwise) lowerStmt(inner, elseContext)
      }
      return
    }
    case 'pay': {
      const amount = lowerExpr(stmt.amount, context)
      const date = lowerExpr(stmt.date, context)
      const discount = g.exp(g.neg(g.mul(context.rate, date)))
      const contribution = g.mul(g.mul(g.mul(context.condition, context.alive.value), discount), amount)
      context.cashflow.value = g.add(context.cashflow.value, contribution)
      return
    }
    case 'stop':
      context.alive.value = g.mul(context.alive.value, g.sub(g.constant(1), context.condition))
      return
    case 'exercise': {
      const mask = g.input('batch', `exercise_${context.eventTime}`)
      const payStmt = stmt.body.find((inner) => inner.kind === 'pay')
      const intrinsic = payStmt !== undefined && payStmt.kind === 'pay' ? lowerExpr(payStmt.amount, context) : g.constant(0)
      context.exercises.push({ date: context.eventTime, intrinsic, underlying: fixingAt(context.fixings, context.eventTime), mask })
      const exerciseContext: StmtContext = { ...context, condition: g.mul(context.condition, mask) }
      for (const inner of stmt.body) lowerStmt(inner, exerciseContext)
      context.alive.value = g.mul(context.alive.value, g.sub(g.constant(1), exerciseContext.condition))
      return
    }
  }
}

export function compileProduct(product: Product): CompiledProduct {
  registerBuiltinOps()
  if (product.underlyings.length !== 1) throw new Error('exactly one underlying is supported')
  const underlying = product.underlyings[0]
  if (underlying.model !== 'gbm') throw new Error(`model '${underlying.model}' is not supported yet`)

  const paramDefaults = computeParamDefaults(product)
  const instances = expandEvents(product, paramDefaults)
  const times = [...new Set(instances.map((instance) => instance.time))].filter((t) => t > 0).sort((a, b) => a - b)

  const graph = new Graph()
  const spot = graph.input('scalar', 'spot')
  const rate = graph.input('scalar', 'rate')
  const vol = graph.input('scalar', 'vol')
  const params = new Map<string, Value>()
  const env = new Map<string, Value>()
  for (const param of product.params) {
    const value = graph.input('scalar', `param_${param.name}`)
    params.set(param.name, value)
    env.set(param.name, value)
  }

  const { fixings, normals } = buildPath(graph, spot, rate, vol, times)

  const baseContext: ExprContext = { graph, env, spot, rate, underlying: underlying.name, eventVar: '', eventTime: 0, timeValue: graph.constant(0), fixings, paramDefaults }
  for (const declaration of product.vars) env.set(declaration.name, lowerExpr(declaration.init, baseContext))

  const alive = { value: graph.constant(1) }
  const cashflow = { value: graph.constant(0) }
  const exercises: ExerciseRecord[] = []
  for (const instance of instances) {
    const context: StmtContext = {
      ...baseContext,
      eventVar: instance.variable,
      eventTime: instance.time,
      timeValue: graph.constant(instance.time),
      condition: graph.constant(1),
      alive,
      cashflow,
      exercises,
    }
    for (const stmt of instance.body) lowerStmt(stmt, context)
  }

  const price = graph.mean(cashflow.value)
  graph.output = price
  return { graph, spot, rate, vol, params, paramDefaults, normals, times, price, cashflow: cashflow.value, riskFactors: [spot, rate, vol], exercises }
}

export interface ProductMarket {
  readonly spot: number
  readonly rate: number
  readonly vol: number
  readonly params?: Readonly<Record<string, number>>
}

export interface ProductPricingResult {
  readonly price: number
  readonly standardError: number
  readonly greeks: Readonly<Record<string, number>>
}

function regress(intrinsic: Float64Array, level: Float64Array, value: Float64Array): number[] | null {
  const ata = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const aty = [0, 0, 0]
  let count = 0
  for (let p = 0; p < value.length; p += 1) {
    if (intrinsic[p] <= 0) continue
    count += 1
    const basis = [1, level[p], level[p] * level[p]]
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) ata[i][j] += basis[i] * basis[j]
      aty[i] += basis[i] * value[p]
    }
  }
  return count >= 3 ? solveLinearSystem(ata, aty) : null
}

function fillExerciseMasks(compiled: CompiledProduct, bindings: Map<number, Float64Array>, paths: number, rate: number): void {
  const exercises = [...compiled.exercises].sort((a, b) => a.date - b.date)
  const masks = exercises.map(() => new Float64Array(paths))
  for (const exercise of exercises) bindings.set(exercise.mask.id, new Float64Array(paths))

  const forward = evaluate(compiled.graph, bindings, paths)
  const intrinsics = exercises.map((exercise) => forward.get(exercise.intrinsic.id)!)
  const levels = exercises.map((exercise) => forward.get(exercise.underlying.id)!)

  const value = new Float64Array(paths)
  const chosen = new Int32Array(paths).fill(-1)
  for (let k = exercises.length - 1; k >= 0; k -= 1) {
    if (k < exercises.length - 1) {
      const discount = Math.exp(-rate * (exercises[k + 1].date - exercises[k].date))
      for (let p = 0; p < paths; p += 1) value[p] *= discount
    }
    const intrinsic = intrinsics[k]
    const level = levels[k]
    const coefficients = regress(intrinsic, level, value)
    for (let p = 0; p < paths; p += 1) {
      if (intrinsic[p] <= 0) continue
      const continuation = coefficients === null ? 0 : coefficients[0] + coefficients[1] * level[p] + coefficients[2] * level[p] * level[p]
      if (intrinsic[p] > continuation) {
        value[p] = intrinsic[p]
        chosen[p] = k
      }
    }
  }

  for (let p = 0; p < paths; p += 1) {
    if (chosen[p] >= 0) masks[chosen[p]][p] = 1
  }
  for (let k = 0; k < exercises.length; k += 1) bindings.set(exercises[k].mask.id, masks[k])
}

export function priceProduct(product: Product, market: ProductMarket, paths: number, seed: number): ProductPricingResult {
  const compiled = compileProduct(product)
  const bindings = new Map<number, Float64Array>([
    [compiled.spot.id, new Float64Array([market.spot])],
    [compiled.rate.id, new Float64Array([market.rate])],
    [compiled.vol.id, new Float64Array([market.vol])],
  ])
  for (const [name, value] of compiled.params) {
    const override = market.params?.[name]
    bindings.set(value.id, new Float64Array([override ?? compiled.paramDefaults.get(name) ?? 0]))
  }
  for (let k = 0; k < compiled.normals.length; k += 1) {
    bindings.set(compiled.normals[k].id, standardNormals(paths, (seed + k * SEED_STRIDE) >>> 0))
  }
  if (compiled.exercises.length > 0) fillExerciseMasks(compiled, bindings, paths, market.rate)

  const output = runMonteCarlo(compiled.graph, bindings, paths, compiled.price, compiled.cashflow, compiled.riskFactors)
  return {
    price: output.price,
    standardError: output.standardError,
    greeks: {
      delta: output.gradients.get(compiled.spot.id) ?? 0,
      vega: output.gradients.get(compiled.vol.id) ?? 0,
      rho: output.gradients.get(compiled.rate.id) ?? 0,
    },
  }
}
