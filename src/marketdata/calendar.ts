import { weekday, civilFromDays, addMonths } from './date'

export type BusinessDayConvention = 'none' | 'following' | 'modified_following' | 'preceding'

export class Calendar {
  private readonly holidays: Set<number>

  constructor(holidays: readonly number[] = []) {
    this.holidays = new Set(holidays)
  }

  isBusinessDay(serial: number): boolean {
    const day = weekday(serial)
    return day !== 0 && day !== 6 && !this.holidays.has(serial)
  }

  private next(serial: number): number {
    let s = serial
    while (!this.isBusinessDay(s)) s += 1
    return s
  }

  private previous(serial: number): number {
    let s = serial
    while (!this.isBusinessDay(s)) s -= 1
    return s
  }

  adjust(serial: number, convention: BusinessDayConvention): number {
    if (convention === 'none' || this.isBusinessDay(serial)) return serial
    if (convention === 'preceding') return this.previous(serial)
    const forward = this.next(serial)
    if (convention === 'following') return forward
    const sameMonth = civilFromDays(forward).month === civilFromDays(serial).month
    return sameMonth ? forward : this.previous(serial)
  }
}

export function weekendOnly(): Calendar {
  return new Calendar()
}

export function shift(serial: number, months: number, calendar: Calendar, convention: BusinessDayConvention): number {
  return calendar.adjust(addMonths(serial, months), convention)
}
