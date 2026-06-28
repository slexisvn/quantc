import { civilFromDays, isLeapYear } from './date'

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
  const endOfStartYear = civilFromDaysValue(a.year, 12, 31) + 1
  fraction += (endOfStartYear - start) / (isLeapYear(a.year) ? 366 : 365)
  const startOfEndYear = civilFromDaysValue(b.year, 1, 1)
  fraction += (end - startOfEndYear) / (isLeapYear(b.year) ? 366 : 365)
  for (let year = a.year + 1; year < b.year; year += 1) fraction += 1
  return fraction
}

function civilFromDaysValue(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year
  const era = Math.floor((y >= 0 ? y : y - 399) / 400)
  const yearOfEra = y - era * 400
  const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra - 719468
}

const conventions = new Map<string, DayCount>([
  ['ACT/365', (start, end) => (end - start) / 365],
  ['ACT/360', (start, end) => (end - start) / 360],
  ['30/360', thirty360],
  ['ACT/ACT', actActIsda],
])

export function dayCountFraction(convention: string, start: number, end: number): number {
  const fn = conventions.get(convention)
  if (fn === undefined) throw new Error(`unknown day-count convention ${convention}`)
  return fn(start, end)
}

export function registerDayCount(name: string, fn: DayCount): void {
  if (conventions.has(name)) throw new Error(`duplicate day-count ${name}`)
  conventions.set(name, fn)
}
