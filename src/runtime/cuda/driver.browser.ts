export interface CudaLaunch {
  readonly source: string
  readonly name: string
  readonly scalarInputs: number[]
  readonly batchInputs: number[]
}

export interface CudaAadLaunch {
  readonly source: string
  readonly name: string
  readonly scalarInputs: number[]
  readonly batchInputs: number[]
  readonly reductionIds: number[]
}

const UNAVAILABLE = 'CUDA is unavailable in the browser build'

export function cudaAvailable(): boolean {
  return false
}

export function deviceArchitecture(): string {
  throw new Error(UNAVAILABLE)
}

export function launchReductionKernel(_launch: CudaLaunch, _scalarValues: Map<number, number>, _batchData: Map<number, Float64Array>, _batchSize: number, _targetArchitecture?: string): number {
  throw new Error(UNAVAILABLE)
}

export function launchMultiReductionKernel(_launch: CudaAadLaunch, _scalarValues: Map<number, number>, _batchData: Map<number, Float64Array>, _batchSize: number, _targetArchitecture?: string): Map<number, number> {
  throw new Error(UNAVAILABLE)
}
