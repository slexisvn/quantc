import { createRequire } from 'node:module'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const koffi = require('koffi')

function locateNvrtc(): string {
  const root = process.env.CUDA_PATH
  if (root === undefined) throw new Error('CUDA_PATH is not set')
  const binary = join(root, 'bin')
  const match = readdirSync(binary).find((name) => /^nvrtc64_\d+_\d+\.dll$/.test(name))
  if (match === undefined) throw new Error('nvrtc runtime compiler not found')
  return join(binary, match)
}

const COMPUTE_CAPABILITY_MAJOR = 75
const COMPUTE_CAPABILITY_MINOR = 76

interface Driver {
  cuInit: (flags: number) => number
  cuDeviceGet: (device: number[], ordinal: number) => number
  cuDeviceGetAttribute: (value: number[], attribute: number, device: number) => number
  cuCtxCreate: (context: unknown[], flags: number, device: number) => number
  cuModuleLoadData: (module: unknown[], image: unknown) => number
  cuModuleGetFunction: (fn: unknown[], module: unknown, name: string) => number
  cuMemAlloc: (pointer: Array<number | bigint>, bytes: number) => number
  cuMemcpyHtoD: (destination: bigint, source: unknown, bytes: number) => number
  cuMemcpyDtoH: (destination: unknown, source: bigint, bytes: number) => number
  cuLaunchKernel: (fn: unknown, gx: number, gy: number, gz: number, bx: number, by: number, bz: number, shared: number, stream: unknown, params: unknown, extra: unknown) => number
  cuCtxSynchronize: () => number
  cuMemFree: (pointer: bigint) => number
}

interface Nvrtc {
  nvrtcCreateProgram: (program: unknown[], source: string, name: string, numHeaders: number, headers: unknown, includes: unknown) => number
  nvrtcCompileProgram: (program: unknown, numOptions: number, options: string[]) => number
  nvrtcGetPTXSize: (program: unknown, size: number[]) => number
  nvrtcGetPTX: (program: unknown, ptx: unknown) => number
  nvrtcGetProgramLogSize: (program: unknown, size: number[]) => number
  nvrtcGetProgramLog: (program: unknown, log: unknown) => number
}

let driver: Driver | null = null
let nvrtc: Nvrtc | null = null
let context: unknown = null
let architecture = 'compute_70'

function loadDriver(): Driver {
  const lib = koffi.load('nvcuda.dll')
  return {
    cuInit: lib.func('int cuInit(unsigned int flags)'),
    cuDeviceGet: lib.func('int cuDeviceGet(_Out_ int *device, int ordinal)'),
    cuDeviceGetAttribute: lib.func('int cuDeviceGetAttribute(_Out_ int *pi, int attrib, int dev)'),
    cuCtxCreate: lib.func('int cuCtxCreate(_Out_ void **pctx, unsigned int flags, int dev)'),
    cuModuleLoadData: lib.func('int cuModuleLoadData(_Out_ void **module, void *image)'),
    cuModuleGetFunction: lib.func('int cuModuleGetFunction(_Out_ void **func, void *hmod, const char *name)'),
    cuMemAlloc: lib.func('int cuMemAlloc(_Out_ uint64 *dptr, size_t bytesize)'),
    cuMemcpyHtoD: lib.func('int cuMemcpyHtoD(uint64 dst, void *src, size_t bytecount)'),
    cuMemcpyDtoH: lib.func('int cuMemcpyDtoH(void *dst, uint64 src, size_t bytecount)'),
    cuLaunchKernel: lib.func('int cuLaunchKernel(void *f, unsigned int gx, unsigned int gy, unsigned int gz, unsigned int bx, unsigned int by, unsigned int bz, unsigned int shared, void *stream, void **params, void **extra)'),
    cuCtxSynchronize: lib.func('int cuCtxSynchronize()'),
    cuMemFree: lib.func('int cuMemFree(uint64 dptr)'),
  }
}

function loadNvrtc(): Nvrtc {
  const lib = koffi.load(locateNvrtc())
  return {
    nvrtcCreateProgram: lib.func('int nvrtcCreateProgram(_Out_ void **prog, const char *src, const char *name, int numHeaders, void *headers, void *includeNames)'),
    nvrtcCompileProgram: lib.func('int nvrtcCompileProgram(void *prog, int numOptions, const char **options)'),
    nvrtcGetPTXSize: lib.func('int nvrtcGetPTXSize(void *prog, _Out_ size_t *ptxSizeRet)'),
    nvrtcGetPTX: lib.func('int nvrtcGetPTX(void *prog, char *ptx)'),
    nvrtcGetProgramLogSize: lib.func('int nvrtcGetProgramLogSize(void *prog, _Out_ size_t *logSizeRet)'),
    nvrtcGetProgramLog: lib.func('int nvrtcGetProgramLog(void *prog, char *log)'),
  }
}

function check(code: number, label: string): void {
  if (code !== 0) throw new Error(`${label} failed with code ${code}`)
}

function ensureContext(): { driver: Driver; nvrtc: Nvrtc } {
  if (driver === null) driver = loadDriver()
  if (nvrtc === null) nvrtc = loadNvrtc()
  if (context === null) {
    check(driver.cuInit(0), 'cuInit')
    const device: number[] = [0]
    check(driver.cuDeviceGet(device, 0), 'cuDeviceGet')
    const created: unknown[] = [null]
    check(driver.cuCtxCreate(created, 0, device[0]), 'cuCtxCreate')
    context = created[0]
    const major: number[] = [0]
    const minor: number[] = [0]
    check(driver.cuDeviceGetAttribute(major, COMPUTE_CAPABILITY_MAJOR, device[0]), 'cuDeviceGetAttribute')
    check(driver.cuDeviceGetAttribute(minor, COMPUTE_CAPABILITY_MINOR, device[0]), 'cuDeviceGetAttribute')
    architecture = `compute_${major[0]}${minor[0]}`
  }
  return { driver, nvrtc }
}

export function deviceArchitecture(): string {
  ensureContext()
  return architecture
}

export function cudaAvailable(): boolean {
  try {
    ensureContext()
    return true
  } catch {
    return false
  }
}

function compileToPtx(nvrtcLib: Nvrtc, source: string, architecture: string): Buffer {
  const program: unknown[] = [null]
  check(nvrtcLib.nvrtcCreateProgram(program, source, 'kernel.cu', 0, null, null), 'nvrtcCreateProgram')
  const options = [`--gpu-architecture=${architecture}`]
  const status = nvrtcLib.nvrtcCompileProgram(program[0], options.length, options)
  if (status !== 0) {
    const logSize: number[] = [0]
    nvrtcLib.nvrtcGetProgramLogSize(program[0], logSize)
    const log = Buffer.alloc(Number(logSize[0]))
    nvrtcLib.nvrtcGetProgramLog(program[0], log)
    throw new Error(`nvrtcCompileProgram failed: ${log.toString('utf8')}`)
  }
  const ptxSize: number[] = [0]
  check(nvrtcLib.nvrtcGetPTXSize(program[0], ptxSize), 'nvrtcGetPTXSize')
  const ptx = Buffer.alloc(Number(ptxSize[0]))
  check(nvrtcLib.nvrtcGetPTX(program[0], ptx), 'nvrtcGetPTX')
  return ptx
}

export interface CudaLaunch {
  readonly source: string
  readonly name: string
  readonly scalarInputs: number[]
  readonly batchInputs: number[]
}

export function launchReductionKernel(launch: CudaLaunch, scalarValues: Map<number, number>, batchData: Map<number, Float64Array>, batchSize: number, targetArchitecture?: string): number {
  const { driver: d, nvrtc: n } = ensureContext()
  const ptx = compileToPtx(n, launch.source, targetArchitecture ?? architecture)

  const module: unknown[] = [null]
  check(d.cuModuleLoadData(module, ptx), 'cuModuleLoadData')
  const fn: unknown[] = [null]
  check(d.cuModuleGetFunction(fn, module[0], launch.name), 'cuModuleGetFunction')

  const devicePointers: bigint[] = []
  const argumentBuffers: Array<Float64Array | BigUint64Array | Int32Array> = []

  for (const id of launch.scalarInputs) {
    const value = scalarValues.get(id)
    if (value === undefined) throw new Error(`missing scalar input ${id}`)
    argumentBuffers.push(new Float64Array([value]))
  }

  for (const id of launch.batchInputs) {
    const data = batchData.get(id)
    if (data === undefined) throw new Error(`missing batch input ${id}`)
    const pointer: Array<number | bigint> = [0]
    check(d.cuMemAlloc(pointer, data.byteLength), 'cuMemAlloc')
    const devicePointer = BigInt(pointer[0])
    devicePointers.push(devicePointer)
    check(d.cuMemcpyHtoD(devicePointer, data, data.byteLength), 'cuMemcpyHtoD')
    argumentBuffers.push(new BigUint64Array([devicePointer]))
  }

  const resultPointerHandle: Array<number | bigint> = [0]
  check(d.cuMemAlloc(resultPointerHandle, 8), 'cuMemAlloc')
  const resultPointer = BigInt(resultPointerHandle[0])
  devicePointers.push(resultPointer)
  check(d.cuMemcpyHtoD(resultPointer, new Float64Array([0]), 8), 'cuMemcpyHtoD')
  argumentBuffers.push(new BigUint64Array([resultPointer]))
  argumentBuffers.push(new Int32Array([batchSize]))

  const kernelParams = new BigUint64Array(argumentBuffers.length)
  for (let i = 0; i < argumentBuffers.length; i += 1) kernelParams[i] = BigInt(koffi.address(argumentBuffers[i]))

  const block = 256
  const grid = Math.ceil(batchSize / block)
  check(d.cuLaunchKernel(fn[0], grid, 1, 1, block, 1, 1, 0, null, kernelParams, null), 'cuLaunchKernel')
  check(d.cuCtxSynchronize(), 'cuCtxSynchronize')

  const host = new Float64Array(1)
  check(d.cuMemcpyDtoH(host, resultPointer, 8), 'cuMemcpyDtoH')

  for (const pointer of devicePointers) d.cuMemFree(pointer)
  return host[0]
}

export interface CudaAadLaunch {
  readonly source: string
  readonly name: string
  readonly scalarInputs: number[]
  readonly batchInputs: number[]
  readonly reductionIds: number[]
}

export function launchMultiReductionKernel(launch: CudaAadLaunch, scalarValues: Map<number, number>, batchData: Map<number, Float64Array>, batchSize: number, targetArchitecture?: string): Map<number, number> {
  const { driver: d, nvrtc: n } = ensureContext()
  const ptx = compileToPtx(n, launch.source, targetArchitecture ?? architecture)

  const module: unknown[] = [null]
  check(d.cuModuleLoadData(module, ptx), 'cuModuleLoadData')
  const fn: unknown[] = [null]
  check(d.cuModuleGetFunction(fn, module[0], launch.name), 'cuModuleGetFunction')

  const devicePointers: bigint[] = []
  const argumentBuffers: Array<Float64Array | BigUint64Array | Int32Array> = []

  for (const id of launch.scalarInputs) {
    const value = scalarValues.get(id)
    if (value === undefined) throw new Error(`missing scalar input ${id}`)
    argumentBuffers.push(new Float64Array([value]))
  }

  for (const id of launch.batchInputs) {
    const data = batchData.get(id)
    if (data === undefined) throw new Error(`missing batch input ${id}`)
    const pointer: Array<number | bigint> = [0]
    check(d.cuMemAlloc(pointer, data.byteLength), 'cuMemAlloc')
    const devicePointer = BigInt(pointer[0])
    devicePointers.push(devicePointer)
    check(d.cuMemcpyHtoD(devicePointer, data, data.byteLength), 'cuMemcpyHtoD')
    argumentBuffers.push(new BigUint64Array([devicePointer]))
  }

  const resultPointers: bigint[] = []
  for (let k = 0; k < launch.reductionIds.length; k += 1) {
    const handle: Array<number | bigint> = [0]
    check(d.cuMemAlloc(handle, 8), 'cuMemAlloc')
    const pointer = BigInt(handle[0])
    devicePointers.push(pointer)
    resultPointers.push(pointer)
    check(d.cuMemcpyHtoD(pointer, new Float64Array([0]), 8), 'cuMemcpyHtoD')
    argumentBuffers.push(new BigUint64Array([pointer]))
  }
  argumentBuffers.push(new Int32Array([batchSize]))

  const kernelParams = new BigUint64Array(argumentBuffers.length)
  for (let i = 0; i < argumentBuffers.length; i += 1) kernelParams[i] = BigInt(koffi.address(argumentBuffers[i]))

  const block = 256
  const grid = Math.ceil(batchSize / block)
  check(d.cuLaunchKernel(fn[0], grid, 1, 1, block, 1, 1, 0, null, kernelParams, null), 'cuLaunchKernel')
  check(d.cuCtxSynchronize(), 'cuCtxSynchronize')

  const results = new Map<number, number>()
  for (let k = 0; k < launch.reductionIds.length; k += 1) {
    const host = new Float64Array(1)
    check(d.cuMemcpyDtoH(host, resultPointers[k], 8), 'cuMemcpyDtoH')
    results.set(launch.reductionIds[k], host[0])
  }

  for (const pointer of devicePointers) d.cuMemFree(pointer)
  return results
}
