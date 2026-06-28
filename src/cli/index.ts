import { priceEuropean, type EuropeanSpec } from '../engines/mc-engine'

function parseArguments(argv: readonly string[]): Map<string, string> {
  const args = new Map<string, string>()
  for (let i = 0; i < argv.length - 1; i += 1) {
    const token = argv[i]
    if (token.startsWith('--')) args.set(token.slice(2), argv[i + 1])
  }
  return args
}

function number(args: Map<string, string>, key: string, fallback: number): number {
  const value = args.get(key)
  return value === undefined ? fallback : Number(value)
}

export function runCli(argv: readonly string[]): string {
  const args = parseArguments(argv)
  const spec: EuropeanSpec = {
    payoff: args.get('payoff') ?? 'max(spot - strike, 0)',
    spot: number(args, 'spot', 100),
    strike: number(args, 'strike', 100),
    rate: number(args, 'rate', 0.03),
    vol: number(args, 'vol', 0.2),
    maturity: number(args, 'maturity', 1),
    paths: number(args, 'paths', 200000),
    seed: number(args, 'seed', 12345),
    model: args.get('model') ?? 'gbm',
  }

  const result = priceEuropean(spec)
  const lines = [
    `payoff       ${spec.payoff}`,
    `price        ${result.price.toFixed(6)}`,
    `stderr       ${result.standardError.toFixed(6)}`,
    `delta        ${result.greeks.delta.toFixed(6)}`,
    `gamma        ${result.greeks.gamma.toFixed(6)}`,
    `vega         ${result.greeks.vega.toFixed(6)}`,
    `rho          ${result.greeks.rho.toFixed(6)}`,
    `theta        ${result.greeks.theta.toFixed(6)}`,
  ]
  return lines.join('\n')
}
