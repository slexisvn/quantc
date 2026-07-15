import * as esbuild from 'esbuild'
import { chmod, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const entry = resolve(root, 'src/index.ts')
const driverStub = resolve(root, 'src/runtime/cuda/driver.browser.ts')

const nodeBuiltinStub = `const fail = () => { throw new Error('Node built-ins are unavailable in the browser build') }
export const readFileSync = fail
export const readdirSync = fail
export const createRequire = fail
export const join = fail
export const fileURLToPath = fail
export default new Proxy({}, { get: () => fail })`

const browserStubs = {
  name: 'browser-stubs',
  setup(build) {
    build.onResolve({ filter: /driver$/ }, (args) => {
      const target = resolve(args.resolveDir, args.path).replace(/\\/g, '/')
      return target.endsWith('runtime/cuda/driver') ? { path: driverStub } : undefined
    })
    build.onResolve({ filter: /^koffi$/ }, () => ({ path: 'koffi', namespace: 'stub-empty' }))
    build.onResolve({ filter: /^node:(fs|module|path|url|os|crypto)$/ }, (args) => ({ path: args.path, namespace: 'stub-node' }))
    build.onLoad({ filter: /.*/, namespace: 'stub-empty' }, () => ({ contents: 'export default {}', loader: 'js' }))
    build.onLoad({ filter: /.*/, namespace: 'stub-node' }, () => ({ contents: nodeBuiltinStub, loader: 'js' }))
  },
}

const common = {
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  sourcemap: false,
  legalComments: 'none',
}

await rm(dist, { recursive: true, force: true })

await Promise.all([
  esbuild.build({
    ...common,
    entryPoints: [entry],
    outfile: resolve(dist, 'index.node.js'),
    platform: 'node',
    target: 'node18',
    external: ['koffi'],
  }),
  esbuild.build({
    ...common,
    entryPoints: [entry],
    outfile: resolve(dist, 'index.browser.js'),
    platform: 'browser',
    target: 'es2020',
    conditions: ['browser'],
    mainFields: ['browser', 'module', 'main'],
    plugins: [browserStubs],
  }),
])

const cli = `#!/usr/bin/env node
import { runCli } from './index.node.js'

try {
  process.stdout.write(\`\${runCli(process.argv.slice(2))}\\n\`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(\`quantc: \${message}\\n\`)
  process.exitCode = 1
}
`

const cliOutfile = resolve(dist, 'index.cli.js')
await writeFile(cliOutfile, cli)
await chmod(cliOutfile, 0o755)
