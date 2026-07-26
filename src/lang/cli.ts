import { readFileSync } from 'fs'
import { parseProduct } from './parser'
import { checkProduct } from './typecheck'
import { printProduct } from './printer'
import { priceProduct, type ProductMarket, type ProductPricingResult } from './compile'

export function checkScript(source: string): string[] {
  return checkProduct(parseProduct(source)).map((error) => `${error.line}:${error.col}: ${error.message}`)
}

export function printScript(source: string): string {
  return printProduct(parseProduct(source))
}

export function priceScript(source: string, market: ProductMarket, paths: number, seed: number): ProductPricingResult {
  const product = parseProduct(source)
  const errors = checkProduct(product)
  if (errors.length > 0) throw new Error(`type errors:\n${errors.map((e) => `${e.line}:${e.col}: ${e.message}`).join('\n')}`)

  return priceProduct(product, market, paths, seed, { greeks: 'first-order' })
}

function parseFlags(args: readonly string[]): Map<string, string> {
  const flags = new Map<string, string>()
  for (let i = 0; i < args.length - 1; i += 1) {
    if (args[i].startsWith('--')) flags.set(args[i].slice(2), args[i + 1])
  }
  return flags
}

function flagNumber(flags: Map<string, string>, key: string, fallback: number): number {
  const value = flags.get(key)
  return value === undefined ? fallback : Number(value)
}

export function runLangCli(argv: readonly string[]): string {
  const command = argv[0]
  const file = argv[1]
  if (command === undefined || file === undefined) return 'usage: quill <run|check|print> file.quill'
  const source = readFileSync(file, 'utf8')

  if (command === 'check') {
    const errors = checkScript(source)
    return errors.length === 0 ? 'ok' : errors.join('\n')
  }
  if (command === 'print') return printScript(source)
  if (command === 'run') {
    const flags = parseFlags(argv.slice(2))
    const market: ProductMarket = { spot: flagNumber(flags, 'spot', 100), rate: flagNumber(flags, 'rate', 0.03), vol: flagNumber(flags, 'vol', 0.2) }
    const result = priceScript(source, market, flagNumber(flags, 'paths', 100000), flagNumber(flags, 'seed', 1))
    return [
      `price   ${result.price.toFixed(6)}`,
      `stderr  ${result.standardError.toFixed(6)}`,
      `delta   ${result.greeks.delta.toFixed(6)}`,
      `vega    ${result.greeks.vega.toFixed(6)}`,
      `rho     ${result.greeks.rho.toFixed(6)}`,
    ].join('\n')
  }
  return `unknown command '${command}'`
}
