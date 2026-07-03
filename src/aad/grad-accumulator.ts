import { Accumulator } from './accumulator'

function addArrays(a: Float64Array, b: Float64Array): Float64Array {
  const n = a.length >= b.length ? a.length : b.length
  const out = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    out[i] = (a.length === 1 ? a[0] : a[i]) + (b.length === 1 ? b[0] : b[i])
  }
  return out
}

export class GradAccumulator extends Accumulator<Float64Array> {
  constructor() {
    super(addArrays)
  }
}
