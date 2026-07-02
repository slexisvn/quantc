import { describe, it, expect } from 'vitest'
import { purgedKFold, combinatorialPurgedCv } from '../../src/alpha/cv'

const horizon = 5
const length = 100
const eventEnds = Array.from({ length }, (_, i) => Math.min(i + horizon, length - 1))

describe('purged k-fold', () => {
  const folds = purgedKFold(eventEnds, 5, 0.02)

  it('produces the requested number of folds covering all indices as test once', () => {
    expect(folds.length).toBe(5)
    const seen = new Array<number>(length).fill(0)
    for (const fold of folds) for (const i of fold.test) seen[i] += 1
    expect(seen.every((count) => count === 1)).toBe(true)
  })

  it('no train event span intersects the test span', () => {
    for (const fold of folds) {
      const testStart = Math.min(...fold.test)
      const testEnd = Math.max(...fold.test) + 1
      for (const i of fold.train) {
        const overlaps = i < testEnd && eventEnds[i] >= testStart
        expect(overlaps).toBe(false)
      }
    }
  })

  it('embargo indices after each test span are excluded from train', () => {
    const embargo = Math.floor(0.02 * length)
    for (const fold of folds) {
      const testEnd = Math.max(...fold.test) + 1
      for (let i = testEnd; i < Math.min(length, testEnd + embargo); i += 1) {
        expect(fold.train.includes(i)).toBe(false)
      }
    }
  })

  it('with point labels and no embargo it reduces to plain k-fold', () => {
    const pointEnds = Array.from({ length }, (_, i) => i)
    for (const fold of purgedKFold(pointEnds, 4, 0)) {
      expect(fold.train.length + fold.test.length).toBe(length)
    }
  })
})

describe('combinatorial purged cv', () => {
  const folds = combinatorialPurgedCv(eventEnds, 10, 2, 0.01)

  it('yields C(10,2) folds with uniform block coverage', () => {
    expect(folds.length).toBe(45)
    const testCounts = new Array<number>(length).fill(0)
    for (const fold of folds) for (const i of fold.test) testCounts[i] += 1
    expect(testCounts.every((count) => count === 9)).toBe(true)
  })

  it('keeps the purge property on every fold', () => {
    for (const fold of folds) {
      const testSet = new Set(fold.test)
      for (const i of fold.train) {
        for (let s = i; s <= eventEnds[i]; s += 1) expect(testSet.has(s)).toBe(false)
      }
    }
  })
})
