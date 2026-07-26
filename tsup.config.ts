import { resolve } from 'node:path'
import { mkdirSync, rmSync } from "node:fs"
import { defineConfig } from 'tsup'
import type { Plugin } from 'esbuild'

const entry = ['src/index.ts']
const dist = resolve(import.meta.dirname, "dist");
const driverStub = resolve('src/runtime/cuda/driver.browser.ts')

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const nodeBuiltinStub = `const fail = () => { throw new Error('Node built-ins are unavailable in the browser build') }
export const readFileSync = fail
export const readdirSync = fail
export const createRequire = fail
export const join = fail
export const fileURLToPath = fail
export default new Proxy({}, { get: () => fail })`

const browserStubs: Plugin = {
  name: 'browser-stubs',
  setup(build) {
    build.onResolve({ filter: /driver$/ }, (args) => {
      const target = resolve(args.resolveDir, args.path).replace(/\\/g, '/')
      return target.endsWith('runtime/cuda/driver') ? { path: driverStub } : undefined
    })
    build.onResolve({ filter: /^koffi$/ }, () => ({ path: 'koffi', namespace: 'stub-empty' }))
     build.onResolve(
      { filter: /^(node:)?(fs|module|path|url|os|crypto)$/ },
      (args) => ({ path: args.path, namespace: 'stub-node' }),
    )
    build.onLoad({ filter: /.*/, namespace: 'stub-empty' }, () => ({ contents: 'export default {}', loader: 'js' }))
    build.onLoad({ filter: /.*/, namespace: 'stub-node' }, () => ({ contents: nodeBuiltinStub, loader: 'js' }))
  },
}

export default defineConfig([
  {
    entry,
    bundle: true,
    clean: true,
    dts: true,
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    splitting: false,
    target: 'node18',
    external: ['koffi'],
    outExtension: () => ({ js: '.node.js' }),
  },
  {
    entry,
    bundle: true,
    clean: false,
    dts: false,
    esbuildPlugins: [browserStubs],
    format: ['esm'],
    outDir: 'dist',
    platform: 'browser',
    splitting: false,
    target: 'es2020',
    outExtension: () => ({ js: '.browser.js' }),
  },
])
