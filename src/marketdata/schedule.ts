import { addMonths } from './date'
import { Calendar, type BusinessDayConvention } from './calendar'

export interface ScheduleSpec {
  readonly start: number
  readonly end: number
  readonly frequencyMonths: number
  readonly calendar: Calendar
  readonly convention: BusinessDayConvention
}

export function generateSchedule(spec: ScheduleSpec): number[] {
  const unadjusted: number[] = []
  let count = 1
  for (;;) {
    const date = addMonths(spec.start, count * spec.frequencyMonths)
    if (date >= spec.end) break
    unadjusted.push(date)
    count += 1
  }
  unadjusted.push(spec.end)
  return unadjusted.map((date) => spec.calendar.adjust(date, spec.convention))
}
