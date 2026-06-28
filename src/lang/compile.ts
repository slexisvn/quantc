import { Graph } from '../ir/graph'
import type { Value } from '../ir/value'
import { registerBuiltinOps } from '../ir/ops/index'
import { runMonteCarlo } from '../engines/mc-core'
import { evaluate } from '../eval/interpreter'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { cholesky } from '../numerics/linalg/cholesky'
import { DiscountCurve } from '../marketdata/curve'
import { standardNormals } from '../numerics/sampling'
import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { hwAlpha, hwDecay, hwStepStd, hwBondLogA, hwBFactor } from '../models/rates/hull-white-affine'
import { g2ppVariance, type G2ppSpec } from '../models/rates/g2pp'
import type { Expr, Stmt, Product, EventDecl } from './ast'
import { isModel, modelParams, isRateModel, extraNormalsPerStep, modelNeedsVol, needsFineGrid } from './models'

const SEED_STRIDE = 2654435761

interface JumpInput {
  readonly input: Value
  readonly asset: string
  readonly step: number
}

interface DiscountInput {
  readonly time: number
  readonly value: Value
}

interface RateScalarInput {
  readonly input: Value
  readonly kind: 'alpha' | 'decay' | 'stepStd' | 'flat' | 'bondConst' | 'bondLoading'
  readonly asset: string
  readonly time?: number
  readonly dt?: number
  readonly maturity?: number
  readonly factorIndex?: number
}

const HESTON_STEPS_PER_YEAR = 16

function refineGrid(eventTimes: number[], stepsPerYear: number): number[] {
  if (eventTimes.length === 0) return eventTimes
  const maxDt = 1 / stepsPerYear
  const points = new Set<number>(eventTimes)
  let previous = 0
  for (const t of eventTimes) {
    const span = t - previous
    const sub = Math.max(1, Math.ceil(span / maxDt))
    for (let i = 1; i < sub; i += 1) points.add(previous + (span * i) / sub)
    previous = t
  }
  return [...points].filter((x) => x > 0).sort((a, b) => a - b)
}

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

interface AssetPath {
  readonly name: string
  readonly fixings: Fixing[]
}

interface AssetSpec {
  readonly name: string
  readonly model: string
  readonly spot: Value
  readonly vol: Value
  readonly driftAdjust: Value
  readonly params: Map<string, Value>
}

interface ExprContext {
  readonly graph: Graph
  readonly env: Map<string, Value>
  readonly discountFor: (time: number) => Value
  readonly stochasticDiscountFor: ((time: number) => Value | undefined) | null
  readonly assets: Map<string, AssetPath>
  readonly assetOrder: string[]
  readonly eventVar: string
  readonly eventTime: number
  readonly timeValue: Value
  readonly paramDefaults: Map<string, number>
  readonly timeShift: number
  readonly rateScalarInputs: RateScalarInput[]
  readonly bondCoeffs: Map<string, Value>
  readonly rateFactors: Map<string, Map<number, Value[]>>
  readonly models: Map<string, string>
}

interface StmtContext extends ExprContext {
  condition: Value
  readonly alive: { value: Value }
  readonly cashflow: { value: Value }
  readonly exercises: ExerciseRecord[]
}

export interface CompiledProduct {
  readonly graph: Graph
  readonly spots: Map<string, Value>
  readonly vols: Map<string, Value>
  readonly driftAdjust: Map<string, Value>
  readonly models: Map<string, string>
  readonly modelParamInputs: Map<string, Map<string, Value>>
  readonly modelParamDefaults: Map<string, Map<string, number>>
  readonly assetOrder: string[]
  readonly cholInputs: Value[][] | null
  readonly rateInputs: Value[]
  readonly discountInputs: Map<number, DiscountInput>
  readonly jumpInputs: JumpInput[]
  readonly rateScalarInputs: RateScalarInput[]
  readonly params: Map<string, Value>
  readonly paramDefaults: Map<string, number>
  readonly normals: Value[]
  readonly times: number[]
  readonly price: Value
  readonly cashflow: Value
  readonly riskFactors: Value[]
  readonly exercises: ExerciseRecord[]
}

export interface CompileOptions {
  readonly timeShift?: number
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

function expandEvents(product: Product, defaults: Map<string, number>, timeShift: number): EventInstance[] {
  const instances: EventInstance[] = []
  for (const event of product.events) instances.push(...expandEvent(event, defaults))
  const shifted = timeShift === 0 ? instances : instances.map((instance) => ({ ...instance, time: instance.time - timeShift }))
  return shifted.sort((a, b) => a.time - b.time)
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

interface StepCtx {
  readonly time: number
  readonly dt: number
  readonly dtConst: Value
  readonly sqrtDt: Value
  readonly step: number
  readonly previous: number
  readonly effRate: Value
  readonly increment: Value
  readonly extraZ: Value | undefined
}

interface PathCtx {
  readonly graph: Graph
  readonly half: Value
  readonly one: Value
  readonly zero: Value
  readonly logState: Map<string, Value>
  readonly level: Map<string, Value>
  readonly variance: Map<string, Value>
  readonly xState: Map<string, Value>
  readonly yState: Map<string, Value>
  readonly integralState: Map<string, Value>
  readonly stochDiscount: Map<string, Map<number, Value>>
  readonly rateFactors: Map<string, Map<number, Value[]>>
  readonly fixingsByAsset: Map<string, Fixing[]>
  readonly jumpInputs: JumpInput[]
  readonly rateScalarInputs: RateScalarInput[]
  readonly alphaInput: (asset: string, t: number) => Value
  readonly flatInput: (asset: string) => Value
}

interface ModelKernel {
  init(ctx: PathCtx, spec: AssetSpec): void
  step(ctx: PathCtx, spec: AssetSpec, s: StepCtx): void
}

function pushFixing(ctx: PathCtx, name: string, time: number, value: Value): void {
  ctx.fixingsByAsset.get(name)!.push({ time, value })
}

function lognormalKernel(displaced: boolean): ModelKernel {
  return {
    init(ctx, spec) {
      ctx.fixingsByAsset.set(spec.name, [{ time: 0, value: spec.spot }])
      const base = displaced ? ctx.graph.add(spec.spot, spec.params.get('shift')!) : spec.spot
      ctx.logState.set(spec.name, ctx.graph.log(base))
    },
    step(ctx, spec, s) {
      const g = ctx.graph
      const name = spec.name
      const vol = spec.vol
      const drift = g.mul(g.sub(s.effRate, g.mul(g.mul(ctx.half, vol), vol)), s.dtConst)
      const diffusion = g.mul(g.mul(vol, s.sqrtDt), s.increment)
      const newLog = g.add(g.add(ctx.logState.get(name)!, drift), diffusion)
      ctx.logState.set(name, newLog)
      const price = displaced ? g.sub(g.exp(newLog), spec.params.get('shift')!) : g.exp(newLog)
      pushFixing(ctx, name, s.time, price)
    },
  }
}

const bachelierKernel: ModelKernel = {
  init(ctx, spec) {
    ctx.fixingsByAsset.set(spec.name, [{ time: 0, value: spec.spot }])
    ctx.level.set(spec.name, spec.spot)
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const current = ctx.level.get(name)!
    const drift = g.mul(g.mul(s.effRate, current), s.dtConst)
    const diffusion = g.mul(g.mul(spec.vol, s.sqrtDt), s.increment)
    const next = g.add(g.add(current, drift), diffusion)
    ctx.level.set(name, next)
    pushFixing(ctx, name, s.time, next)
  },
}

const hestonKernel: ModelKernel = {
  init(ctx, spec) {
    ctx.fixingsByAsset.set(spec.name, [{ time: 0, value: spec.spot }])
    ctx.logState.set(spec.name, ctx.graph.log(spec.spot))
    ctx.variance.set(spec.name, spec.params.get('v0')!)
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const kappa = spec.params.get('kappa')!
    const theta = spec.params.get('theta')!
    const xi = spec.params.get('xi')!
    const rho = spec.params.get('rho')!
    const v = ctx.variance.get(name)!
    const vPlus = g.max(v, ctx.zero)
    const scale = g.mul(g.sqrt(vPlus), s.sqrtDt)
    const complement = g.sqrt(g.sub(ctx.one, g.mul(rho, rho)))
    const wV = g.add(g.mul(rho, s.increment), g.mul(complement, s.extraZ!))
    const drift = g.mul(g.sub(s.effRate, g.mul(ctx.half, vPlus)), s.dtConst)
    const newLog = g.add(g.add(ctx.logState.get(name)!, drift), g.mul(scale, s.increment))
    ctx.logState.set(name, newLog)
    const meanReversion = g.mul(g.mul(kappa, g.sub(theta, vPlus)), s.dtConst)
    const volOfVol = g.mul(g.mul(xi, scale), wV)
    ctx.variance.set(name, g.add(g.add(v, meanReversion), volOfVol))
    pushFixing(ctx, name, s.time, g.exp(newLog))
  },
}

const mertonKernel: ModelKernel = {
  init(ctx, spec) {
    ctx.fixingsByAsset.set(spec.name, [{ time: 0, value: spec.spot }])
    ctx.logState.set(spec.name, ctx.graph.log(spec.spot))
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const sigma = spec.vol
    const lambda = spec.params.get('jumpIntensity')!
    const jm = spec.params.get('jumpMean')!
    const jv = spec.params.get('jumpVol')!
    const kappa = g.sub(g.exp(g.add(jm, g.mul(ctx.half, g.mul(jv, jv)))), ctx.one)
    const compensator = g.mul(lambda, kappa)
    const jumpInput = g.input('batch', `jump_${name}_${s.time}`)
    ctx.jumpInputs.push({ input: jumpInput, asset: name, step: s.step })
    const driftRate = g.sub(g.sub(s.effRate, g.mul(ctx.half, g.mul(sigma, sigma))), compensator)
    const drift = g.mul(driftRate, s.dtConst)
    const diffusion = g.mul(g.mul(sigma, s.sqrtDt), s.increment)
    const newLog = g.add(g.add(g.add(ctx.logState.get(name)!, drift), diffusion), jumpInput)
    ctx.logState.set(name, newLog)
    pushFixing(ctx, name, s.time, g.exp(newLog))
  },
}

const cevKernel: ModelKernel = {
  init(ctx, spec) {
    ctx.fixingsByAsset.set(spec.name, [{ time: 0, value: spec.spot }])
    ctx.level.set(spec.name, spec.spot)
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const beta = spec.params.get('beta')!
    const current = ctx.level.get(name)!
    const safe = g.max(current, g.constant(1e-8))
    const localVol = g.mul(spec.vol, g.exp(g.mul(beta, g.log(safe))))
    const drift = g.mul(g.mul(s.effRate, current), s.dtConst)
    const diffusion = g.mul(g.mul(localVol, s.sqrtDt), s.increment)
    const next = g.max(g.add(g.add(current, drift), diffusion), ctx.zero)
    ctx.level.set(name, next)
    pushFixing(ctx, name, s.time, next)
  },
}

const hw1fKernel: ModelKernel = {
  init(ctx, spec) {
    const name = spec.name
    ctx.xState.set(name, ctx.zero)
    ctx.integralState.set(name, ctx.zero)
    ctx.stochDiscount.set(name, new Map())
    const factors = new Map<number, Value[]>()
    ctx.rateFactors.set(name, factors)
    const r0 = ctx.alphaInput(name, 0)
    ctx.fixingsByAsset.set(name, [{ time: 0, value: r0 }])
    factors.set(0, [r0])
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const decayInput = g.input('scalar', `hw_decay_${name}_${s.step}`)
    const stepStdInput = g.input('scalar', `hw_stepstd_${name}_${s.step}`)
    ctx.rateScalarInputs.push({ input: decayInput, kind: 'decay', asset: name, dt: s.dt })
    ctx.rateScalarInputs.push({ input: stepStdInput, kind: 'stepStd', asset: name, dt: s.dt })
    const x = ctx.xState.get(name)!
    const integral = g.add(ctx.integralState.get(name)!, g.mul(g.add(x, ctx.alphaInput(name, s.previous)), s.dtConst))
    ctx.integralState.set(name, integral)
    const xNew = g.add(g.mul(x, decayInput), g.mul(stepStdInput, s.increment))
    ctx.xState.set(name, xNew)
    const rFix = g.add(xNew, ctx.alphaInput(name, s.time))
    pushFixing(ctx, name, s.time, rFix)
    ctx.stochDiscount.get(name)!.set(s.time, g.exp(g.neg(integral)))
    ctx.rateFactors.get(name)!.set(s.time, [rFix])
  },
}

const g2ppKernel: ModelKernel = {
  init(ctx, spec) {
    const name = spec.name
    ctx.xState.set(name, ctx.zero)
    ctx.integralState.set(name, ctx.zero)
    ctx.stochDiscount.set(name, new Map())
    const factors = new Map<number, Value[]>()
    ctx.rateFactors.set(name, factors)
    ctx.yState.set(name, ctx.zero)
    ctx.fixingsByAsset.set(name, [{ time: 0, value: ctx.flatInput(name) }])
    factors.set(0, [ctx.zero, ctx.zero])
  },
  step(ctx, spec, s) {
    const g = ctx.graph
    const name = spec.name
    const aRev = spec.params.get('meanReversionA')!
    const bRev = spec.params.get('meanReversionB')!
    const sigma = spec.params.get('volA')!
    const eta = spec.params.get('volB')!
    const rho = spec.params.get('correlation')!
    const flat = ctx.flatInput(name)
    const x = ctx.xState.get(name)!
    const y = ctx.yState.get(name)!
    const integral = g.add(ctx.integralState.get(name)!, g.mul(g.add(g.add(x, y), flat), s.dtConst))
    ctx.integralState.set(name, integral)
    const z2 = g.add(g.mul(rho, s.increment), g.mul(g.sqrt(g.sub(ctx.one, g.mul(rho, rho))), s.extraZ!))
    const xNew = g.add(x, g.add(g.mul(g.neg(g.mul(aRev, x)), s.dtConst), g.mul(g.mul(sigma, s.sqrtDt), s.increment)))
    const yNew = g.add(y, g.add(g.mul(g.neg(g.mul(bRev, y)), s.dtConst), g.mul(g.mul(eta, s.sqrtDt), z2)))
    ctx.xState.set(name, xNew)
    ctx.yState.set(name, yNew)
    const rFix = g.add(g.add(xNew, yNew), flat)
    pushFixing(ctx, name, s.time, rFix)
    ctx.stochDiscount.get(name)!.set(s.time, g.exp(g.neg(integral)))
    ctx.rateFactors.get(name)!.set(s.time, [xNew, yNew])
  },
}

const KERNELS: Readonly<Record<string, ModelKernel>> = {
  gbm: lognormalKernel(false),
  fx: lognormalKernel(false),
  displaced: lognormalKernel(true),
  bachelier: bachelierKernel,
  heston: hestonKernel,
  merton: mertonKernel,
  cev: cevKernel,
  hw1f: hw1fKernel,
  g2pp: g2ppKernel,
}

function buildPaths(
  graph: Graph,
  specs: AssetSpec[],
  rateInputs: Value[],
  times: number[],
  cholInputs: Value[][] | null,
  rateScalarInputs: RateScalarInput[],
): { assets: Map<string, AssetPath>; normals: Value[]; jumpInputs: JumpInput[]; stochDiscount: Map<string, Map<number, Value>>; rateFactors: Map<string, Map<number, Value[]>> } {
  const n = specs.length
  const half = graph.constant(0.5)
  const one = graph.constant(1)
  const zero = graph.constant(0)

  const fixingsByAsset = new Map<string, Fixing[]>()
  const logState = new Map<string, Value>()
  const level = new Map<string, Value>()
  const variance = new Map<string, Value>()
  const xState = new Map<string, Value>()
  const yState = new Map<string, Value>()
  const integralState = new Map<string, Value>()
  const stochDiscount = new Map<string, Map<number, Value>>()
  const rateFactors = new Map<string, Map<number, Value[]>>()

  const alphaByAsset = new Map<string, Map<number, Value>>()
  const alphaInput = (asset: string, t: number): Value => {
    let perTime = alphaByAsset.get(asset)
    if (perTime === undefined) {
      perTime = new Map()
      alphaByAsset.set(asset, perTime)
    }
    const existing = perTime.get(t)
    if (existing !== undefined) return existing
    const input = graph.input('scalar', `hw_alpha_${asset}_${t}`)
    perTime.set(t, input)
    rateScalarInputs.push({ input, kind: 'alpha', asset, time: t })
    return input
  }

  const flatByAsset = new Map<string, Value>()
  const flatInput = (asset: string): Value => {
    const existing = flatByAsset.get(asset)
    if (existing !== undefined) return existing
    const input = graph.input('scalar', `g2_flat_${asset}`)
    flatByAsset.set(asset, input)
    rateScalarInputs.push({ input, kind: 'flat', asset })
    return input
  }

  const jumpInputs: JumpInput[] = []
  const ctx: PathCtx = {
    graph, half, one, zero,
    logState, level, variance, xState, yState, integralState,
    stochDiscount, rateFactors, fixingsByAsset,
    jumpInputs, rateScalarInputs,
    alphaInput, flatInput,
  }

  for (const spec of specs) KERNELS[spec.model].init(ctx, spec)

  const normals: Value[] = []
  let previous = 0
  for (let step = 0; step < times.length; step += 1) {
    const time = times[step]
    const dt = time - previous
    const dtConst = graph.constant(dt)
    const sqrtDt = graph.sqrt(dtConst)
    const stepRate = rateInputs[step]

    const spotZ: Value[] = []
    for (let i = 0; i < n; i += 1) {
      const z = graph.input('batch', `z_${specs[i].name}_${time}`)
      normals.push(z)
      spotZ.push(z)
    }

    const corr: Value[] = []
    if (cholInputs === null) {
      for (let i = 0; i < n; i += 1) corr.push(spotZ[i])
    } else {
      for (let i = 0; i < n; i += 1) {
        let acc = graph.mul(cholInputs[i][0], spotZ[0])
        for (let j = 1; j <= i; j += 1) acc = graph.add(acc, graph.mul(cholInputs[i][j], spotZ[j]))
        corr.push(acc)
      }
    }

    const extraZ = new Map<string, Value>()
    for (let i = 0; i < n; i += 1) {
      if (extraNormalsPerStep(specs[i].model) > 0) {
        const z = graph.input('batch', `zx_${specs[i].name}_${time}`)
        normals.push(z)
        extraZ.set(specs[i].name, z)
      }
    }

    for (let i = 0; i < n; i += 1) {
      const spec = specs[i]
      const effRate = graph.add(stepRate, spec.driftAdjust)
      const s: StepCtx = { time, dt, dtConst, sqrtDt, step, previous, effRate, increment: corr[i], extraZ: extraZ.get(spec.name) }
      KERNELS[spec.model].step(ctx, spec, s)
    }
    previous = time
  }

  const assets = new Map<string, AssetPath>()
  for (const spec of specs) assets.set(spec.name, { name: spec.name, fixings: fixingsByAsset.get(spec.name)! })
  return { assets, normals, jumpInputs, stochDiscount, rateFactors }
}

function fixingAt(fixings: Fixing[], time: number): Value {
  for (const fixing of fixings) {
    if (Math.abs(fixing.time - time) < 1e-9) return fixing.value
  }
  throw new Error(`no observation available at time ${time}`)
}

function timeOf(expr: Expr, context: ExprContext): number {

  if (expr.kind === 'ident' && expr.name === context.eventVar) return context.eventTime
  const t = evalConst(expr, context.paramDefaults)
  return t <= 0 ? t : t - context.timeShift
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
    case 'let': {

      const value = lowerExpr(expr.value, context)
      const env = new Map(context.env)
      env.set(expr.name, value)
      return lowerExpr(expr.body, { ...context, env })
    }
  }
}

function assetFixings(name: string, context: ExprContext): Fixing[] {
  const asset = context.assets.get(name)
  if (asset === undefined) throw new Error(`unknown underlying '${name}'`)
  return asset.fixings
}

function lowerCall(expr: Extract<Expr, { kind: 'call' }>, context: ExprContext): Value {
  const g = context.graph
  if (context.assets.has(expr.callee)) return fixingAt(assetFixings(expr.callee, context), timeOf(expr.args[0], context))
  if (expr.callee === 'bond') {

    const target = expr.args[0]
    const name = target.kind === 'ident' ? target.name : context.assetOrder[0]
    const t = context.eventTime
    const maturity = timeOf(expr.args[1], context)
    const key = `${name}|${t}|${maturity}`
    const cached = context.bondCoeffs.get(key)
    if (cached !== undefined) return cached
    const factors = context.rateFactors.get(name)?.get(t)
    if (factors === undefined) throw new Error(`bond requires a rate underlying observed at time ${t}`)
    const constInput = g.input('scalar', `bond_const_${name}_${t}_${maturity}`)
    context.rateScalarInputs.push({ input: constInput, kind: 'bondConst', asset: name, time: t, maturity })
    let exponent = constInput
    for (let k = 0; k < factors.length; k += 1) {
      const loading = g.input('scalar', `bond_load${k}_${name}_${t}_${maturity}`)
      context.rateScalarInputs.push({ input: loading, kind: 'bondLoading', asset: name, time: t, maturity, factorIndex: k })
      exponent = g.add(exponent, g.mul(loading, factors[k]))
    }
    const result = g.exp(exponent)
    context.bondCoeffs.set(key, result)
    return result
  }
  if (expr.callee === 'runningMax' || expr.callee === 'runningMin') {
    const target = expr.args[0]
    const name = target.kind === 'ident' ? target.name : context.assetOrder[0]
    const limit = expr.args.length > 1 ? timeOf(expr.args[1], context) : context.eventTime
    const relevant = assetFixings(name, context).filter((f) => f.time <= limit + 1e-9 && f.time > 0)
    let accumulator = relevant[0].value
    for (let i = 1; i < relevant.length; i += 1) accumulator = expr.callee === 'runningMax' ? g.max(accumulator, relevant[i].value) : g.min(accumulator, relevant[i].value)
    return accumulator
  }
  if (expr.callee === 'average') {
    const target = expr.args[0]
    const name = target.kind === 'ident' ? target.name : context.assetOrder[0]
    const relevant = assetFixings(name, context).filter((f) => f.time <= context.eventTime + 1e-9 && f.time > 0)
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
      let amount = lowerExpr(stmt.amount, context)

      if (stmt.currency !== null) amount = g.mul(amount, fixingAt(assetFixings(stmt.currency, context), timeOf(stmt.date, context)))

      const date = timeOf(stmt.date, context)
      const discount = context.stochasticDiscountFor?.(date) ?? context.discountFor(date)
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
      const level = fixingAt(assetFixings(context.assetOrder[0], context), context.eventTime)
      context.exercises.push({ date: context.eventTime, intrinsic, underlying: level, mask })
      const exerciseContext: StmtContext = { ...context, condition: g.mul(context.condition, mask) }
      for (const inner of stmt.body) lowerStmt(inner, exerciseContext)
      context.alive.value = g.mul(context.alive.value, g.sub(g.constant(1), exerciseContext.condition))
      return
    }
  }
}

export function compileProduct(product: Product, options: CompileOptions = {}): CompiledProduct {
  registerBuiltinOps()
  if (product.underlyings.length < 1) throw new Error('a product needs at least one underlying')
  for (const underlying of product.underlyings) {
    if (!isModel(underlying.model)) throw new Error(`model '${underlying.model}' is not supported`)
  }

  const assetOrder = product.underlyings.map((u) => u.name)
  const single = assetOrder.length === 1
  const n = assetOrder.length

  const paramDefaults = computeParamDefaults(product)
  const instances = expandEvents(product, paramDefaults, options.timeShift ?? 0)
  const eventTimes = [...new Set(instances.map((instance) => instance.time))].filter((t) => t > 0).sort((a, b) => a - b)
  const fineGrid = product.underlyings.some((u) => needsFineGrid(u.model))
  const times = fineGrid ? refineGrid(eventTimes, HESTON_STEPS_PER_YEAR) : eventTimes

  const graph = new Graph()
  const spots = new Map<string, Value>()
  const vols = new Map<string, Value>()
  const driftAdjust = new Map<string, Value>()
  const models = new Map<string, string>()
  const modelParamInputs = new Map<string, Map<string, Value>>()
  const modelParamDefaults = new Map<string, Map<string, number>>()
  for (const underlying of product.underlyings) {
    const name = underlying.name
    models.set(name, underlying.model)
    spots.set(name, graph.input('scalar', single ? 'spot' : `spot_${name}`))
    vols.set(name, graph.input('scalar', single ? 'vol' : `vol_${name}`))
    driftAdjust.set(name, graph.input('scalar', `drift_adj_${name}`))
    const inputs = new Map<string, Value>()
    const defaults = new Map<string, number>()
    const fileParams = new Map(underlying.modelParams.map((mp) => [mp.name, mp.value]))
    for (const param of modelParams(underlying.model)) {
      inputs.set(param, graph.input('scalar', `mparam_${name}_${param}`))
      const fileValue = fileParams.get(param)
      if (fileValue !== undefined) defaults.set(param, evalConst(fileValue, paramDefaults))
    }
    modelParamInputs.set(name, inputs)
    modelParamDefaults.set(name, defaults)
  }

  const rateInputs = times.map((_, k) => graph.input('scalar', `rate_step_${k}`))
  const discountInputs = new Map<number, DiscountInput>()
  const discountFor = (time: number): Value => {
    if (Math.abs(time) < 1e-9) return graph.constant(1)
    const key = Math.round(time * 1e6)
    const hit = discountInputs.get(key)
    if (hit) return hit.value
    const input = graph.input('scalar', `df_${time}`)
    discountInputs.set(key, { time, value: input })
    return input
  }

  let cholInputs: Value[][] | null = null
  if (!single) {
    cholInputs = []
    for (let i = 0; i < n; i += 1) {
      const row: Value[] = []
      for (let j = 0; j <= i; j += 1) row.push(graph.input('scalar', `chol_${i}_${j}`))
      cholInputs.push(row)
    }
  }

  const params = new Map<string, Value>()
  const env = new Map<string, Value>()
  for (const param of product.params) {
    const value = graph.input('scalar', `param_${param.name}`)
    params.set(param.name, value)
    env.set(param.name, value)
  }

  const specs: AssetSpec[] = product.underlyings.map((u) => ({
    name: u.name,
    model: u.model,
    spot: spots.get(u.name)!,
    vol: vols.get(u.name)!,
    driftAdjust: driftAdjust.get(u.name)!,
    params: modelParamInputs.get(u.name)!,
  }))
  const rateScalarInputs: RateScalarInput[] = []
  const { assets, normals, jumpInputs, stochDiscount, rateFactors } = buildPaths(graph, specs, rateInputs, times, cholInputs, rateScalarInputs)

  const rateUnderlying = product.underlyings.find((u) => isRateModel(u.model))
  const stochasticDiscountFor = rateUnderlying ? (time: number): Value | undefined => stochDiscount.get(rateUnderlying.name)!.get(time) : null

  const timeShift = options.timeShift ?? 0
  const bondCoeffs = new Map<string, Value>()
  const baseContext: ExprContext = { graph, env, discountFor, stochasticDiscountFor, assets, assetOrder, eventVar: '', eventTime: 0, timeValue: graph.constant(0), paramDefaults, timeShift, rateScalarInputs, bondCoeffs, rateFactors, models }
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

  const equityNames = assetOrder.filter((name) => !isRateModel(models.get(name)!))
  const riskFactors = [...equityNames.map((name) => spots.get(name)!), ...equityNames.map((name) => vols.get(name)!)]
  return { graph, spots, vols, driftAdjust, models, modelParamInputs, modelParamDefaults, assetOrder, cholInputs, rateInputs, discountInputs, jumpInputs, rateScalarInputs, params, paramDefaults, normals, times, price, cashflow: cashflow.value, riskFactors, exercises }
}

export interface QuantoSpec {
  readonly fxVol: number
  readonly correlation: number
}

export interface ProductMarket {
  readonly rate: number
  readonly spot?: number
  readonly vol?: number
  readonly spots?: Readonly<Record<string, number>>
  readonly vols?: Readonly<Record<string, number>>
  readonly correlation?: number[][]
  readonly params?: Readonly<Record<string, number>>
  readonly curve?: DiscountCurve
  readonly quanto?: Readonly<Record<string, QuantoSpec>>
  readonly modelParams?: Readonly<Record<string, Readonly<Record<string, number>>>>
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

function fillExerciseMasks(compiled: CompiledProduct, bindings: Map<number, Float64Array>, paths: number, discountTo: (t: number) => number): void {
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
      const discount = discountTo(exercises[k + 1].date) / discountTo(exercises[k].date)
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

function scalar(value: number): Float64Array {
  return new Float64Array([value])
}

const JUMP_SEED_BASE = 0x9e3779b1

function poissonSample(mean: number, generator: MersenneTwister): number {
  const threshold = Math.exp(-mean)
  let count = 0
  let product = 1
  for (;;) {
    product *= generator.nextDouble()
    if (product <= threshold) return count
    count += 1
  }
}

function compoundPoissonJumps(paths: number, meanCount: number, jumpMean: number, jumpVol: number, seed: number): Float64Array {
  const out = new Float64Array(paths)
  if (meanCount <= 0) return out
  const generator = new MersenneTwister(seed)
  for (let p = 0; p < paths; p += 1) {
    const count = poissonSample(meanCount, generator)
    const z = inverseNormalCdf(generator.nextDouble())
    out[p] = count * jumpMean + jumpVol * Math.sqrt(count) * z
  }
  return out
}

function identityMatrix(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

function discountFactorOf(market: ProductMarket, t: number): number {
  if (t <= 0) return 1
  return market.curve ? market.curve.discountFactor(t) : Math.exp(-market.rate * t)
}

function resolveModelParam(market: ProductMarket, compiled: CompiledProduct, asset: string, param: string): number {
  const override = market.modelParams?.[asset]?.[param]
  if (override !== undefined) return override
  const fallback = compiled.modelParamDefaults.get(asset)?.get(param)
  if (fallback !== undefined) return fallback
  throw new Error(`missing model parameter '${param}' for underlying '${asset}'`)
}

function forwardRateOf(market: ProductMarket, a: number, b: number): number {
  if (b <= a) return market.rate
  return (Math.log(discountFactorOf(market, a)) - Math.log(discountFactorOf(market, b))) / (b - a)
}

function valueCompiled(compiled: CompiledProduct, market: ProductMarket, paths: number, seed: number): ReturnType<typeof runMonteCarlo> {
  const { assetOrder, times } = compiled
  const single = assetOrder.length === 1
  const bindings = new Map<number, Float64Array>()

  for (const name of assetOrder) {

    if (isRateModel(compiled.models.get(name)!)) {
      bindings.set(compiled.spots.get(name)!.id, scalar(0))
      bindings.set(compiled.vols.get(name)!.id, scalar(0))
      bindings.set(compiled.driftAdjust.get(name)!.id, scalar(0))
      continue
    }

    const spotValue = market.spots?.[name] ?? market.spot
    if (spotValue === undefined) throw new Error(`missing spot for underlying '${name}'`)
    bindings.set(compiled.spots.get(name)!.id, scalar(spotValue))

    const volValue = market.vols?.[name] ?? market.vol
    if (volValue === undefined) {
      if (modelNeedsVol(compiled.models.get(name)!)) throw new Error(`missing vol for underlying '${name}'`)
      bindings.set(compiled.vols.get(name)!.id, scalar(0))
    } else {
      bindings.set(compiled.vols.get(name)!.id, scalar(volValue))
    }

    const model = compiled.models.get(name)!
    const effectiveVol = volValue ?? 0
    let adjust = 0
    if (model === 'fx') {
      adjust = -resolveModelParam(market, compiled, name, 'foreignRate')
    } else {
      const quanto = market.quanto?.[name]
      adjust = quanto ? -quanto.correlation * effectiveVol * quanto.fxVol : 0
    }
    bindings.set(compiled.driftAdjust.get(name)!.id, scalar(adjust))
  }

  for (const [name, inputs] of compiled.modelParamInputs) {
    for (const [param, value] of inputs) bindings.set(value.id, scalar(resolveModelParam(market, compiled, name, param)))
  }

  for (const [name, value] of compiled.params) {
    const override = market.params?.[name]
    bindings.set(value.id, scalar(override ?? compiled.paramDefaults.get(name) ?? 0))
  }

  let previous = 0
  for (let k = 0; k < times.length; k += 1) {
    bindings.set(compiled.rateInputs[k].id, scalar(forwardRateOf(market, previous, times[k])))
    previous = times[k]
  }
  for (const { time, value } of compiled.discountInputs.values()) bindings.set(value.id, scalar(discountFactorOf(market, time)))

  if (!single && compiled.cholInputs !== null) {
    const factor = cholesky(market.correlation ?? identityMatrix(assetOrder.length))
    for (let i = 0; i < compiled.cholInputs.length; i += 1) {
      for (let j = 0; j < compiled.cholInputs[i].length; j += 1) bindings.set(compiled.cholInputs[i][j].id, scalar(factor[i][j]))
    }
  }

  for (let k = 0; k < compiled.normals.length; k += 1) {
    bindings.set(compiled.normals[k].id, standardNormals(paths, (seed + k * SEED_STRIDE) >>> 0))
  }

  for (let idx = 0; idx < compiled.jumpInputs.length; idx += 1) {
    const record = compiled.jumpInputs[idx]
    const get = (p: string): number => resolveModelParam(market, compiled, record.asset, p)
    const lambda = get('jumpIntensity')
    const jumpMean = get('jumpMean')
    const jumpVol = get('jumpVol')
    const dt = times[record.step] - (record.step === 0 ? 0 : times[record.step - 1])
    bindings.set(record.input.id, compoundPoissonJumps(paths, lambda * dt, jumpMean, jumpVol, (seed + JUMP_SEED_BASE + idx * SEED_STRIDE) >>> 0))
  }

  if (compiled.rateScalarInputs.length > 0) {
    const curve = market.curve ?? new DiscountCurve([1], [market.rate])
    const rateParam = (asset: string, p: string): number => resolveModelParam(market, compiled, asset, p)
    const g2spec = (asset: string): G2ppSpec => ({
      flatRate: market.rate,
      meanReversionA: rateParam(asset, 'meanReversionA'),
      meanReversionB: rateParam(asset, 'meanReversionB'),
      volA: rateParam(asset, 'volA'),
      volB: rateParam(asset, 'volB'),
      correlation: rateParam(asset, 'correlation'),
    })
    for (const record of compiled.rateScalarInputs) {
      const model = compiled.models.get(record.asset)!
      const a = model === 'hw1f' ? rateParam(record.asset, 'meanReversion') : 0
      const vol = model === 'hw1f' ? rateParam(record.asset, 'vol') : 0
      let value: number
      switch (record.kind) {
        case 'alpha':
          value = hwAlpha(curve, a, vol, record.time!)
          break
        case 'decay':
          value = hwDecay(a, record.dt!)
          break
        case 'stepStd':
          value = hwStepStd(a, vol, record.dt!)
          break
        case 'flat':
          value = market.rate
          break
        case 'bondConst':
          if (model === 'g2pp') {
            const spec = g2spec(record.asset)
            const t = record.time!
            const tenor = record.maturity! - t
            value = -market.rate * tenor + 0.5 * (g2ppVariance(spec, tenor) - g2ppVariance(spec, record.maturity!) + g2ppVariance(spec, t))
          } else {
            value = hwBondLogA(curve, a, vol, record.time!, record.maturity!)
          }
          break
        case 'bondLoading':
          if (model === 'g2pp') {
            const rev = record.factorIndex === 0 ? rateParam(record.asset, 'meanReversionA') : rateParam(record.asset, 'meanReversionB')
            value = -hwBFactor(rev, record.maturity! - record.time!)
          } else {
            value = -hwBFactor(a, record.maturity! - record.time!)
          }
          break
      }
      bindings.set(record.input.id, scalar(value))
    }
  }

  if (compiled.exercises.length > 0) fillExerciseMasks(compiled, bindings, paths, (t) => discountFactorOf(market, t))

  return runMonteCarlo(compiled.graph, bindings, paths, compiled.price, compiled.cashflow, compiled.riskFactors)
}

const THETA_STEP = 1 / 365
const RATE_BUMP = 1e-4

function shiftRate(market: ProductMarket, dr: number): ProductMarket {
  const curve = market.curve ? new DiscountCurve(market.curve.times, market.curve.zeroRates.map((z) => z + dr)) : undefined
  return { ...market, rate: market.rate + dr, curve }
}

function shiftPillar(curve: DiscountCurve, pillar: number, dr: number): DiscountCurve {
  const zeroRates = curve.zeroRates.slice()
  zeroRates[pillar] += dr
  return new DiscountCurve(curve.times, zeroRates)
}

export type GreekDepth = 'price-only' | 'first-order' | 'full'

export interface PricingOptions {
  readonly greeks?: GreekDepth
}

export function priceProduct(product: Product, market: ProductMarket, paths: number, seed: number, options: PricingOptions = {}): ProductPricingResult {
  const depth = options.greeks ?? 'full'
  const compiled = compileProduct(product)
  const { assetOrder } = compiled
  const single = assetOrder.length === 1
  const base = valueCompiled(compiled, market, paths, seed)
  const grad = (g: ReturnType<typeof valueCompiled>['gradients'], id: number): number => g.get(id) ?? 0

  const greeks: Record<string, number> = {}
  if (single) {
    greeks.delta = grad(base.gradients, compiled.spots.get(assetOrder[0])!.id)
    greeks.vega = grad(base.gradients, compiled.vols.get(assetOrder[0])!.id)
  } else {
    for (const name of assetOrder) {
      greeks[`delta_${name}`] = grad(base.gradients, compiled.spots.get(name)!.id)
      greeks[`vega_${name}`] = grad(base.gradients, compiled.vols.get(name)!.id)
    }
  }
  if (depth === 'price-only') return { price: base.price, standardError: base.standardError, greeks }

  const rhoUp = valueCompiled(compiled, shiftRate(market, RATE_BUMP), paths, seed).price
  const rhoDown = valueCompiled(compiled, shiftRate(market, -RATE_BUMP), paths, seed).price
  greeks.rho = (rhoUp - rhoDown) / (2 * RATE_BUMP)
  if (depth === 'first-order') return { price: base.price, standardError: base.standardError, greeks }

  if (single) {
    const name = assetOrder[0]
    const spotId = compiled.spots.get(name)!.id
    const volId = compiled.vols.get(name)!.id

    const spot = market.spots?.[name] ?? market.spot
    const vol = market.vols?.[name] ?? market.vol
    const bumped = (s: number, v: number): ProductMarket => ({
      ...market,
      spot: s,
      vol: v,
      spots: market.spots ? { ...market.spots, [name]: s } : undefined,
      vols: market.vols ? { ...market.vols, [name]: v } : undefined,
    })
    if (spot !== undefined) {
      const volRef = vol ?? 0
      const spotBump = Math.max(Math.abs(spot) * 1e-4, 1e-6)
      const deltaUp = grad(valueCompiled(compiled, bumped(spot + spotBump, volRef), paths, seed).gradients, spotId)
      const deltaDown = grad(valueCompiled(compiled, bumped(spot - spotBump, volRef), paths, seed).gradients, spotId)
      greeks.gamma = (deltaUp - deltaDown) / (2 * spotBump)

      if (vol !== undefined && modelNeedsVol(compiled.models.get(name)!)) {

        const volBump = Math.max(Math.abs(vol) * 5e-2, 1e-3)
        const up = valueCompiled(compiled, bumped(spot, vol + volBump), paths, seed).gradients
        const down = valueCompiled(compiled, bumped(spot, vol - volBump), paths, seed).gradients
        greeks.vanna = (grad(up, spotId) - grad(down, spotId)) / (2 * volBump)
        greeks.volga = (grad(up, volId) - grad(down, volId)) / (2 * volBump)
      }
    }
  }

  if (market.curve) {
    const curve = market.curve
    for (let i = 0; i < curve.times.length; i += 1) {
      const up = valueCompiled(compiled, { ...market, curve: shiftPillar(curve, i, RATE_BUMP) }, paths, seed).price
      const down = valueCompiled(compiled, { ...market, curve: shiftPillar(curve, i, -RATE_BUMP) }, paths, seed).price
      greeks[`rho_pillar_${i}`] = (up - down) / (2 * RATE_BUMP)
    }
  }

  const shifted = compileProduct(product, { timeShift: THETA_STEP })
  const shiftedValue = valueCompiled(shifted, market, paths, seed)
  greeks.theta = (shiftedValue.price - base.price) / THETA_STEP

  return { price: base.price, standardError: base.standardError, greeks }
}
