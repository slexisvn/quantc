export interface CivilDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

export function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year
  const era = Math.floor((y >= 0 ? y : y - 399) / 400)
  const yearOfEra = y - era * 400
  const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra - 719468
}

export function civilFromDays(serial: number): CivilDate {
  const z = serial + 719468
  const era = Math.floor((z >= 0 ? z : z - 146096) / 146097)
  const dayOfEra = z - era * 146097
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365)
  const year = yearOfEra + era * 400
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const monthProgress = Math.floor((5 * dayOfYear + 2) / 153)
  const day = dayOfYear - Math.floor((153 * monthProgress + 2) / 5) + 1
  const month = monthProgress < 10 ? monthProgress + 3 : monthProgress - 9
  return { year: month <= 2 ? year + 1 : year, month, day }
}

export function weekday(serial: number): number {
  return ((((serial % 7) + 4) % 7) + 7) % 7
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function addMonths(serial: number, months: number): number {
  const date = civilFromDays(serial)
  const total = date.year * 12 + (date.month - 1) + months
  const year = Math.floor(total / 12)
  const month = (total % 12) + 1
  const maxDay = month === 2 && isLeapYear(year) ? 29 : MONTH_LENGTHS[month - 1]
  const day = Math.min(date.day, maxDay)
  return daysFromCivil(year, month, day)
}
