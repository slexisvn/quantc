import * as esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
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

const common = { entryPoints: [entry], bundle: true, format: 'esm', logLevel: 'info' }

await esbuild.build({ ...common, outfile: resolve(root, 'dist/quantc.node.js'), platform: 'node', target: 'node18', external: ['koffi'] })
await esbuild.build({ ...common, outfile: resolve(root, 'dist/quantc.browser.js'), platform: 'browser', target: 'es2020', plugins: [browserStubs] })
console.log('built dist/quantc.node.js (node, full) and dist/quantc.browser.js (browser, no cuda)')
