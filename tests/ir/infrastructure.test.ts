import { describe, it, expect } from 'vitest'
import { CalcGraph } from '../../src/runtime/calc-graph'
import { mertonPideCall } from '../../src/engines/pide-jump'
import { mertonCf } from '../../src/analytics/characteristic'
import { cosEuropeanPrice } from '../../src/analytics/cos-method'

describe('pricing dependency graph', () => {
  it('memoizes computations and recomputes only downstream dependents on a market change', () => {
    const graph = new CalcGraph()
    let leftComputes = 0
    let sumComputes = 0
    const a = graph.input(2)
    const b = graph.input(3)
    const scaled = graph.node([a], ([x]) => {
      leftComputes += 1
      return (x as number) * 10
    })
    const total = graph.node([b, scaled], ([y, z]) => {
      sumComputes += 1
      return (y as number) + (z as number)
    })

    expect(graph.get<number>(total)).toBe(23)
    graph.get<number>(total)
    graph.get<number>(scaled)
    expect(leftComputes).toBe(1)
    expect(sumComputes).toBe(1)

    graph.set(b, 5)
    expect(graph.get<number>(total)).toBe(25)
    expect(leftComputes).toBe(1)
    expect(sumComputes).toBe(2)

    graph.set(a, 4)
    expect(graph.get<number>(total)).toBe(45)
    expect(leftComputes).toBe(2)
    expect(sumComputes).toBe(3)
  })
})

describe('jump-diffusion PIDE', () => {
  it('Merton European call matches the COS reference', () => {
    const jumps = { vol: 0.2, jumpIntensity: 0.5, jumpMean: -0.1, jumpVol: 0.15 }
    const pide = mertonPideCall({
      spot: 100, strike: 100, rate: 0.03, maturity: 1, ...jumps,
      spaceSteps: 601, timeSteps: 200, widthStdDev: 6, quadraturePoints: 121,
    })
    const cos = cosEuropeanPrice(mertonCf(0.03, 1, jumps), 100, 100, 0.03, 1, true)
    expect(Math.abs(pide - cos)).toBeLessThan(0.05)
  })
})
