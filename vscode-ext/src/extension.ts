import * as vscode from 'vscode'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { printProduct } from '../../src/lang/printer'
import { priceProduct, type ProductMarket } from '../../src/lang/compile'

const LANG = 'quill'

// --- static language data -------------------------------------------------

const KEYWORDS = [
  'product', 'underlying', 'model', 'param', 'var', 'event', 'in', 'schedule',
  'if', 'then', 'else', 'pay', 'at', 'stop', 'exercise', 'and', 'or', 'not',
]

interface FnDoc {
  readonly sig: string
  readonly doc: string
}

const FUNCTIONS: Record<string, FnDoc> = {
  max: { sig: 'max(a, b)', doc: 'Larger of two values.' },
  min: { sig: 'min(a, b)', doc: 'Smaller of two values.' },
  exp: { sig: 'exp(x)', doc: 'Exponential e^x.' },
  log: { sig: 'log(x)', doc: 'Natural logarithm.' },
  sqrt: { sig: 'sqrt(x)', doc: 'Square root.' },
  abs: { sig: 'abs(x)', doc: 'Absolute value.' },
  runningMax: { sig: 'runningMax(S)', doc: 'Running maximum of an underlying over the fixings so far. Pass the underlying by name; an optional second argument caps the time: runningMax(S, t).' },
  runningMin: { sig: 'runningMin(S)', doc: 'Running minimum of an underlying over the fixings so far. Pass the underlying by name; an optional second argument caps the time: runningMin(S, t).' },
  average: { sig: 'average(S)', doc: 'Arithmetic average of an underlying over the fixings so far. Pass the underlying by name.' },
  bond: { sig: 'bond(r, T)', doc: 'Zero-coupon bond P(t, T) on a Hull-White rate underlying r, observed at the current event time t.' },
}

const MODELS: Record<string, string> = {
  gbm: 'Geometric Brownian motion (lognormal). Uses the `vol` market input.',
  bachelier: 'Bachelier / normal model: dS = rate·S·dt + vol·dW (absolute `vol`).',
  displaced: 'Displaced diffusion — GBM on (S + shift). Params: `shift`.',
  cev: 'Constant-elasticity-of-variance local vol: dS = rate·S·dt + vol·S^beta·dW. Params: `beta` (1→GBM, 0→Bachelier).',
  heston: 'Heston stochastic volatility. Params: `kappa, theta, xi, rho, v0` (uses v0, not `vol`).',
  merton: 'Merton jump-diffusion (lognormal jumps). Params: `jumpIntensity, jumpMean, jumpVol`.',
  hw1f: 'Hull-White 1-factor short rate. Params: `meanReversion, vol`. Use r(t) and bond(r, T); cashflows discount stochastically.',
  g2pp: 'G2++ two-factor short rate. Params: `meanReversionA, meanReversionB, volA, volB, correlation`. Use r(t) and bond(r, T).',
  fx: 'FX rate (Garman-Kohlhagen): GBM drifting at domestic rate minus `foreignRate`. Param: `foreignRate`.',
}

const KEYWORD_DOCS: Record<string, string> = {
  product: 'Declares a product/contract: `product Name { ... }`.',
  underlying: 'Binds an asset to a model: `underlying S model gbm`.',
  model: 'Selects the dynamics for an underlying (e.g. `gbm`).',
  param: 'A compile-time parameter: `param strike = 100`.',
  var: 'Mutable path state, updated inside events: `var accrued = 0`.',
  event: 'A fixing. Single time `event T = 1.0 { ... }` or scheduled `event t in schedule(...) { ... }`.',
  schedule: 'A date schedule: `schedule(start, end, step)`.',
  if: 'Conditional block: `if cond then { ... } else { ... }`.',
  pay: 'Records a cashflow: `pay amount at T`.',
  at: 'Specifies the payment time in a `pay` statement.',
  stop: 'Terminates the current path (e.g. after an autocall trigger).',
  exercise: 'Early-exercise decision (in-graph Longstaff–Schwartz): `exercise continuation { ... }`.',
}

// --- diagnostics ----------------------------------------------------------

function wordRange(doc: vscode.TextDocument, line: number, col: number): vscode.Range {
  const safeLine = Math.min(Math.max(0, line), Math.max(0, doc.lineCount - 1))
  const lineText = doc.lineAt(safeLine).text
  const safeCol = Math.min(Math.max(0, col), lineText.length)
  const pos = new vscode.Position(safeLine, safeCol)
  return doc.getWordRangeAtPosition(pos) ?? new vscode.Range(pos, new vscode.Position(safeLine, Math.min(safeCol + 1, lineText.length)))
}

function refreshDiagnostics(doc: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
  if (doc.languageId !== LANG) return
  const diagnostics: vscode.Diagnostic[] = []
  const text = doc.getText()

  let product
  try {
    product = parseProduct(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const match = /at (\d+):(\d+)/.exec(message)
    const line = match ? Number(match[1]) - 1 : 0
    const col = match ? Number(match[2]) - 1 : 0
    diagnostics.push(new vscode.Diagnostic(wordRange(doc, line, col), message, vscode.DiagnosticSeverity.Error))
    collection.set(doc.uri, diagnostics)
    return
  }

  for (const err of checkProduct(product)) {
    const range = wordRange(doc, err.line - 1, err.col - 1)
    diagnostics.push(new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error))
  }
  collection.set(doc.uri, diagnostics)
}

// --- pricing --------------------------------------------------------------

function readMarket(): { market: ProductMarket; paths: number; seed: number } {
  const cfg = vscode.workspace.getConfiguration('quill')
  return {
    market: {
      spot: cfg.get<number>('market.spot', 100),
      rate: cfg.get<number>('market.rate', 0.03),
      vol: cfg.get<number>('market.vol', 0.2),
    },
    paths: cfg.get<number>('pricing.paths', 100000),
    seed: cfg.get<number>('pricing.seed', 1),
  }
}

function priceCurrentFile(output: vscode.OutputChannel): void {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.languageId !== LANG) {
    void vscode.window.showWarningMessage('Quill: open a .quill file to price.')
    return
  }
  const text = editor.document.getText()
  try {
    const product = parseProduct(text)
    const errors = checkProduct(product)
    if (errors.length > 0) {
      void vscode.window.showErrorMessage(`Quill: ${errors.length} type error(s); fix them before pricing.`)
      return
    }
    const { market, paths, seed } = readMarket()
    const result = priceProduct(product, market, paths, seed)
    const greeks = Object.entries(result.greeks).map(([k, v]) => `  ${k.padEnd(8)} ${v.toFixed(6)}`).join('\n')
    output.appendLine('')
    output.appendLine(`── ${product.name} ─────────────────────────────`)
    output.appendLine(`market   spot=${market.spot} rate=${market.rate} vol=${market.vol}  (paths=${paths}, seed=${seed})`)
    output.appendLine(`price    ${result.price.toFixed(6)}`)
    output.appendLine(`stderr   ${result.standardError.toFixed(6)}`)
    output.appendLine('greeks')
    output.appendLine(greeks)
    output.show(true)
    void vscode.window.showInformationMessage(`Quill: ${product.name} priced at ${result.price.toFixed(4)} (±${result.standardError.toFixed(4)}).`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    void vscode.window.showErrorMessage(`Quill pricing failed: ${message}`)
  }
}

function checkCurrentFile(collection: vscode.DiagnosticCollection): void {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.languageId !== LANG) {
    void vscode.window.showWarningMessage('Quill: open a .quill file to check.')
    return
  }
  refreshDiagnostics(editor.document, collection)
  const count = collection.get(editor.document.uri)?.length ?? 0
  void (count === 0
    ? vscode.window.showInformationMessage('Quill: no errors. ✓')
    : vscode.window.showErrorMessage(`Quill: ${count} error(s) — see Problems panel.`))
}

// --- providers ------------------------------------------------------------

const completionProvider: vscode.CompletionItemProvider = {
  provideCompletionItems() {
    const items: vscode.CompletionItem[] = []
    for (const kw of KEYWORDS) {
      const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword)
      item.documentation = KEYWORD_DOCS[kw] ? new vscode.MarkdownString(KEYWORD_DOCS[kw]) : undefined
      items.push(item)
    }
    for (const [name, info] of Object.entries(FUNCTIONS)) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function)
      item.detail = info.sig
      item.documentation = new vscode.MarkdownString(info.doc)
      item.insertText = new vscode.SnippetString(`${name}($0)`)
      items.push(item)
    }
    for (const [name, doc] of Object.entries(MODELS)) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Value)
      item.documentation = new vscode.MarkdownString(doc)
      items.push(item)
    }
    return items
  },
}

const hoverProvider: vscode.HoverProvider = {
  provideHover(doc, position) {
    const range = doc.getWordRangeAtPosition(position)
    if (!range) return undefined
    const word = doc.getText(range)
    if (FUNCTIONS[word]) {
      const md = new vscode.MarkdownString()
      md.appendCodeblock(FUNCTIONS[word].sig, 'quill')
      md.appendMarkdown(FUNCTIONS[word].doc)
      return new vscode.Hover(md, range)
    }
    if (KEYWORD_DOCS[word]) {
      return new vscode.Hover(new vscode.MarkdownString(`**${word}** — ${KEYWORD_DOCS[word]}`), range)
    }
    if (MODELS[word]) {
      return new vscode.Hover(new vscode.MarkdownString(`**${word}** — ${MODELS[word]}`), range)
    }
    return undefined
  },
}

const formattingProvider: vscode.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits(doc) {
    try {
      const formatted = printProduct(parseProduct(doc.getText()))
      const full = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length))
      const ending = formatted.endsWith('\n') ? formatted : `${formatted}\n`
      return [vscode.TextEdit.replace(full, ending)]
    } catch {
      // parse errors surface via diagnostics; don't touch the buffer
      return []
    }
  },
}

// --- activation -----------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = vscode.languages.createDiagnosticCollection('quill')
  const output = vscode.window.createOutputChannel('Quill')
  context.subscriptions.push(diagnostics, output)

  for (const doc of vscode.workspace.textDocuments) refreshDiagnostics(doc, diagnostics)

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => refreshDiagnostics(doc, diagnostics)),
    vscode.workspace.onDidChangeTextDocument((e) => refreshDiagnostics(e.document, diagnostics)),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri)),
    vscode.languages.registerCompletionItemProvider(LANG, completionProvider),
    vscode.languages.registerHoverProvider(LANG, hoverProvider),
    vscode.languages.registerDocumentFormattingEditProvider(LANG, formattingProvider),
    vscode.commands.registerCommand('quill.price', () => priceCurrentFile(output)),
    vscode.commands.registerCommand('quill.check', () => checkCurrentFile(diagnostics)),
  )
}

export function deactivate(): void {
  // nothing to clean up beyond context.subscriptions
}
