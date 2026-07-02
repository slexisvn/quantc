import { describe, it, expect } from 'vitest'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { tsMean, tsStd, tsSum, tsProduct, tsMin, tsMax, tsArgmax, tsArgmin, tsRank, tsDelay, tsDelta, decayLinear, tsCorr, tsCov } from '../../src/alpha/ts-operators'
import { csRank, csZscore, csDemean, csWinsorize, csTruncate, csScale, csNeutralize } from '../../src/alpha/cs-operators'
import { pipe, elementwise, toReturnsOperator, OPERATORS } from '../../src/alpha/operators'
import { rankMomentum } from '../../src/alpha/signals'
import { compose } from '../../src/alpha/types'
import type { Matrix, Operator } from '../../src/alpha/types'
import { equalWeight } from '../../src/alpha/portfolio'
import { backtest } from '../../src/alpha/backtest'
import { pearson } from '../../src/alpha/stats'

function randomMatrix(t: number, n: number, seed: number): Matrix {
  const rng = new MersenneTwister(seed)
  return Array.from({ length: t }, () => Array.from({ length: n }, () => rng.nextDouble() * 2 - 1))
}

function naivePerColumn(m: Matrix, window: number, fn: (slice: number[]) => number): Matrix {
  return m.map((row, i) =>
    row.map((_, j) => {
      if (i < window - 1) return 0
      const slice: number[] = []
      for (let k = i - window + 1; k <= i; k += 1) slice.push(m[k][j])
      return fn(slice)
    }),
  )
}

function expectMatrixClose(actual: Matrix, expected: Matrix, digits = 9): void {
  expect(actual.length).toBe(expected.length)
  for (let i = 0; i < actual.length; i += 1) {
    for (let j = 0; j < actual[i].length; j += 1) expect(actual[i][j]).toBeCloseTo(expected[i][j], digits)
  }
}

const T = 60
const N = 3
const W = 7
const data = randomMatrix(T, N, 42)

describe('time-series operators match naive recomputation', () => {
  it('tsMean', () => {
    expectMatrixClose(tsMean(W)(data), naivePerColumn(data, W, (s) => s.reduce((a, b) => a + b, 0) / W))
  })

  it('tsStd', () => {
    expectMatrixClose(
      tsStd(W)(data),
      naivePerColumn(data, W, (s) => {
        const mean = s.reduce((a, b) => a + b, 0) / W
        return Math.sqrt(s.reduce((a, b) => a + (b - mean) * (b - mean), 0) / W)
      }),
    )
  })

  it('tsSum', () => {
    expectMatrixClose(tsSum(W)(data), naivePerColumn(data, W, (s) => s.reduce((a, b) => a + b, 0)))
  })

  it('tsProduct', () => {
    expectMatrixClose(tsProduct(W)(data), naivePerColumn(data, W, (s) => s.reduce((a, b) => a * b, 1)))
  })

  it('tsMin and tsMax', () => {
    expectMatrixClose(tsMin(W)(data), naivePerColumn(data, W, (s) => Math.min(...s)))
    expectMatrixClose(tsMax(W)(data), naivePerColumn(data, W, (s) => Math.max(...s)))
  })

  it('tsArgmax and tsArgmin emit periods since extreme', () => {
    expectMatrixClose(tsArgmax(W)(data), naivePerColumn(data, W, (s) => s.length - 1 - s.lastIndexOf(Math.max(...s))))
    expectMatrixClose(tsArgmin(W)(data), naivePerColumn(data, W, (s) => s.length - 1 - s.lastIndexOf(Math.min(...s))))
  })

  it('tsRank', () => {
    expectMatrixClose(
      tsRank(W)(data),
      naivePerColumn(data, W, (s) => s.filter((x) => x < s[s.length - 1]).length / (W - 1)),
    )
  })

  it('decayLinear', () => {
    expectMatrixClose(
      decayLinear(W)(data),
      naivePerColumn(data, W, (s) => {
        const totalWeight = (W * (W + 1)) / 2
        return s.reduce((a, b, k) => a + b * (k + 1), 0) / totalWeight
      }),
    )
  })

  it('tsCorr and tsCov against naive window statistics', () => {
    const other = randomMatrix(T, N, 7)
    const corr = tsCorr(other, W)(data)
    const cov = tsCov(other, W)(data)
    for (let i = W - 1; i < T; i += 1) {
      for (let j = 0; j < N; j += 1) {
        const x: number[] = []
        const y: number[] = []
        for (let k = i - W + 1; k <= i; k += 1) {
          x.push(data[k][j])
          y.push(other[k][j])
        }
        const meanX = x.reduce((a, b) => a + b, 0) / W
        const meanY = y.reduce((a, b) => a + b, 0) / W
        const naiveCov = x.reduce((a, b, k) => a + (b - meanX) * (y[k] - meanY), 0) / W
        expect(cov[i][j]).toBeCloseTo(naiveCov, 9)
        expect(corr[i][j]).toBeCloseTo(pearson(x, y), 9)
      }
    }
  })

  it('tsCorr over the full length equals pearson', () => {
    const other = randomMatrix(T, N, 11)
    const corr = tsCorr(other, T)(data)
    for (let j = 0; j < N; j += 1) {
      expect(corr[T - 1][j]).toBeCloseTo(
        pearson(
          data.map((row) => row[j]),
          other.map((row) => row[j]),
        ),
        9,
      )
    }
  })

  it('tsDelay shifts and tsDelta differences exactly', () => {
    const delayed = tsDelay(3)(data)
    const diffed = tsDelta(3)(data)
    for (let i = 3; i < T; i += 1) {
      for (let j = 0; j < N; j += 1) {
        expect(delayed[i][j]).toBe(data[i - 3][j])
        expect(diffed[i][j]).toBeCloseTo(data[i][j] - data[i - 3][j], 12)
      }
    }
    expect(delayed[2][0]).toBe(0)
  })
})

describe('time-series operators are causal', () => {
  const cutoff = 30
  const operators: [string, Operator][] = [
    ['tsMean', tsMean(W)],
    ['tsStd', tsStd(W)],
    ['tsZscore', OPERATORS.tsZscore({ window: W })],
    ['tsSum', tsSum(W)],
    ['tsProduct', tsProduct(W)],
    ['tsMin', tsMin(W)],
    ['tsMax', tsMax(W)],
    ['tsArgmax', tsArgmax(W)],
    ['tsArgmin', tsArgmin(W)],
    ['tsRank', tsRank(W)],
    ['tsDelay', tsDelay(2)],
    ['tsDelta', tsDelta(2)],
    ['decayLinear', decayLinear(W)],
    ['tsCorr', tsCorr(randomMatrix(T, N, 5), W)],
  ]

  it.each(operators)('%s ignores future data', (_name, operator) => {
    const perturbed = data.map((row, i) => (i > cutoff ? row.map((x) => x + 100) : row.slice()))
    const base = operator(data)
    const shifted = operator(perturbed)
    for (let i = 0; i <= cutoff; i += 1) {
      for (let j = 0; j < N; j += 1) expect(shifted[i][j]).toBe(base[i][j])
    }
  })
})

describe('cross-sectional operators', () => {
  const row = [3, -1, 4, 1, -5]
  const m: Matrix = [row]

  it('csRank maps to [0,1] and is invariant under monotone transforms', () => {
    const ranked = csRank()(m)[0]
    const transformed = csRank()([row.map((x) => Math.exp(x))])[0]
    expect(Math.min(...ranked)).toBe(0)
    expect(Math.max(...ranked)).toBe(1)
    ranked.forEach((r, j) => expect(transformed[j]).toBeCloseTo(r, 12))
  })

  it('csDemean and csZscore center each row', () => {
    const demeaned = csDemean()(m)[0]
    const scored = csZscore()(m)[0]
    expect(demeaned.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 12)
    expect(scored.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 12)
  })

  it('csWinsorize clips to row quantiles', () => {
    const clipped = csWinsorize(0.25, 0.75)(m)[0]
    const sorted = [...row].sort((a, b) => a - b)
    expect(Math.min(...clipped)).toBeGreaterThanOrEqual(sorted[0])
    expect(Math.max(...clipped)).toBeLessThanOrEqual(sorted[sorted.length - 1])
    expect(clipped[1]).toBe(-1)
  })

  it('csTruncate caps at the gross fraction', () => {
    const gross = row.reduce((a, b) => a + Math.abs(b), 0)
    const capped = csTruncate(0.2)(m)[0]
    capped.forEach((x) => expect(Math.abs(x)).toBeLessThanOrEqual(0.2 * gross + 1e-12))
  })

  it('csScale normalizes gross exposure', () => {
    const scaled = csScale(2)(m)[0]
    expect(scaled.reduce((a, b) => a + Math.abs(b), 0)).toBeCloseTo(2, 12)
  })

  it('csNeutralize zeroes each group mean', () => {
    const groups = ['a', 'a', 'b', 'b', 'b']
    const neutral = csNeutralize(groups)(m)[0]
    expect(neutral[0] + neutral[1]).toBeCloseTo(0, 12)
    expect(neutral[2] + neutral[3] + neutral[4]).toBeCloseTo(0, 12)
  })
})

describe('composition', () => {
  it('pipe applies operators left to right', () => {
    const double: Operator = (m) => m.map((row) => row.map((x) => x * 2))
    const addOne: Operator = (m) => m.map((row) => row.map((x) => x + 1))
    const piped = pipe(double, addOne)(data)
    const manual = addOne(double(data))
    expectMatrixClose(piped, manual, 12)
  })

  it('elementwise combines two matrices', () => {
    const other = randomMatrix(T, N, 3)
    const sum = elementwise((a, b) => a + b)(data, other)
    expect(sum[5][1]).toBeCloseTo(data[5][1] + other[5][1], 12)
  })

  it('a piped operator runs through backtest as a signal', () => {
    const prices: Matrix = Array.from({ length: 80 }, (_, i) => Array.from({ length: 4 }, (_, j) => 100 + i * (j + 1) * 0.1))
    const signal = pipe(toReturnsOperator(), tsSum(10), csRank(), csDemean())
    const result = backtest(prices, compose(signal, equalWeight()), { cost: 0.0005 })
    expect(result.equity.length).toBeGreaterThan(0)
    expect(Number.isFinite(result.metrics.sharpe)).toBe(true)
  })

  it('rankMomentum signal is dollar neutral with unit gross after warmup', () => {
    const prices = randomMatrix(50, 5, 9).map((row, i) => row.map((x) => 100 + x + i * 0.01))
    const score = rankMomentum(10)(prices)
    const late = score[40]
    expect(late.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 9)
    expect(late.reduce((a, b) => a + Math.abs(b), 0)).toBeCloseTo(1, 9)
  })

  it('registry factories build working operators', () => {
    const fromRegistry = OPERATORS.tsMean({ window: W })(data)
    expectMatrixClose(fromRegistry, tsMean(W)(data), 12)
  })
})
