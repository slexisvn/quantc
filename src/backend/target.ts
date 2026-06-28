export type Fp64Class = 'full' | 'throttled'

export interface Target {
  readonly name: string
  readonly kind: 'cpu' | 'cuda'
  readonly vectorWidth: number
  readonly fp64: Fp64Class
  readonly threadModel: 'scalar' | 'simd' | 'warp'
}

export const cpuTarget: Target = {
  name: 'cpu',
  kind: 'cpu',
  vectorWidth: 4,
  fp64: 'full',
  threadModel: 'simd',
}

export const cudaTarget: Target = {
  name: 'cuda',
  kind: 'cuda',
  vectorWidth: 32,
  fp64: 'throttled',
  threadModel: 'warp',
}
