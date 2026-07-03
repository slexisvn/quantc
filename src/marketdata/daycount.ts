import { civilFromDays, daysFromCivil, isLeapYear } from './date'
import { createRegistry } from '../registry'

export type DayCount = (start: number, end: number) => number

function thirty360(start: number, end: number): number {
  const a = civilFromDays(start)
  const b = civilFromDays(end)
  const d1 = Math.min(a.day, 30)
  const d2 = d1 === 30 ? Math.min(b.day, 30) : b.day
  return ((b.year - a.year) * 360 + (b.month - a.month) * 30 + (d2 - d1)) / 360
}

function actActIsda(start: number, end: number): number {
  if (end <= start) return 0
  const a = civilFromDays(start)
  const b = civilFromDays(end)
  if (a.year === b.year) return (end - start) / (isLeapYear(a.year) ? 366 : 365)
  let fraction = 0
  const endOfStartYear = daysFromCivil(a.year, 12, 31) + 1
  fraction += (endOfStartYear - start) / (isLeapYear(a.year) ? 366 : 365)
  const startOfEndYear = daysFromCivil(b.year, 1, 1)
  fraction += (end - startOfEndYear) / (isLeapYear(b.year) ? 366 : 365)
  for (let year = a.year + 1; year < b.year; year += 1) fraction += 1
  return fraction
}

const conventions = createRegistry<DayCount>('day-count convention', [
  ['ACT/365', (start, end) => (end - start) / 365],
  ['ACT/360', (start, end) => (end - start) / 360],
  ['30/360', thirty360],
  ['ACT/ACT', actActIsda],
])

export function dayCountFraction(convention: string, start: number, end: number): number {
  return conventions.get(convention)(start, end)
}

export function registerDayCount(name: string, fn: DayCount): void {
  conventions.register(name, fn)
}
