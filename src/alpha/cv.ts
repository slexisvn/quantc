import { combinations } from './combinatorics'

export interface PurgedFold {
  readonly train: number[]
  readonly test: number[]
}

type Span = readonly [number, number]

function blockSpans(length: number, blocks: number): Span[] {
  return Array.from({ length: blocks }, (_, b) => [Math.floor((b * length) / blocks), Math.floor(((b + 1) * length) / blocks)] as const)
}

function buildFold(eventEnds: readonly number[], testSpans: readonly Span[], embargo: number): PurgedFold {
  const length = eventEnds.length
  const test: number[] = []
  for (const [start, end] of testSpans) for (let i = start; i < end; i += 1) test.push(i)
  const excluded = new Uint8Array(length)
  for (const [start, end] of testSpans) {
    for (let i = 0; i < length; i += 1) {
      if (i < end && eventEnds[i] >= start) excluded[i] = 1
    }
    for (let i = end; i < Math.min(length, end + embargo); i += 1) excluded[i] = 1
  }
  const train: number[] = []
  for (let i = 0; i < length; i += 1) if (excluded[i] === 0) train.push(i)
  return { train, test }
}

export function purgedKFold(eventEnds: readonly number[], folds = 5, embargoFraction = 0.01): PurgedFold[] {
  const length = eventEnds.length
  const embargo = Math.floor(embargoFraction * length)
  return blockSpans(length, folds).map((span) => buildFold(eventEnds, [span], embargo))
}

export function combinatorialPurgedCv(eventEnds: readonly number[], blocks = 10, testBlocks = 2, embargoFraction = 0.01): PurgedFold[] {
  const length = eventEnds.length
  const embargo = Math.floor(embargoFraction * length)
  const spans = blockSpans(length, blocks)
  return combinations(blocks, testBlocks).map((chosen) => buildFold(eventEnds, chosen.map((b) => spans[b]), embargo))
}
