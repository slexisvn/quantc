import { describe, it, expect } from 'vitest'
import { daysFromCivil, weekday, addMonths } from '../src/marketdata/date'
import { dayCountFraction } from '../src/marketdata/daycount'
import { Calendar } from '../src/marketdata/calendar'
import { generateSchedule } from '../src/marketdata/schedule'
import { bootstrapFromParSwaps } from '../src/marketdata/bootstrap'
import { parSwapRate, swapValue } from '../src/instruments/swap'
import { swapKeyRateSensitivities } from '../src/risk/curve-risk'

describe('dates and day-count conventions', () => {
  it('computes day-count fractions', () => {
    const start = daysFromCivil(2024, 1, 1)
    const end = daysFromCivil(2025, 1, 1)
    expect(dayCountFraction('ACT/365', start, end)).toBeCloseTo(366 / 365, 12)
    expect(dayCountFraction('30/360', start, end)).toBeCloseTo(1, 12)
    expect(dayCountFraction('ACT/360', start, daysFromCivil(2024, 7, 1))).toBeCloseTo((daysFromCivil(2024, 7, 1) - start) / 360, 12)
  })

  it('identifies weekdays', () => {
    expect(weekday(daysFromCivil(1970, 1, 1))).toBe(4)
    expect(weekday(daysFromCivil(2024, 1, 6))).toBe(6)
  })
})

describe('calendar and schedule', () => {
  it('applies modified-following business-day adjustment', () => {
    const calendar = new Calendar()
    const saturday = daysFromCivil(2024, 6, 1)
    expect(weekday(saturday)).toBe(6)
    const adjusted = calendar.adjust(saturday, 'modified_following')
    expect(calendar.isBusinessDay(adjusted)).toBe(true)
    expect(adjusted).toBe(daysFromCivil(2024, 6, 3))
  })

  it('generates an adjusted quarterly schedule', () => {
    const calendar = new Calendar()
    const schedule = generateSchedule({
      start: daysFromCivil(2024, 1, 15),
      end: addMonths(daysFromCivil(2024, 1, 15), 12),
      frequencyMonths: 3,
      calendar,
      convention: 'modified_following',
    })
    expect(schedule.length).toBe(4)
    for (const date of schedule) expect(calendar.isBusinessDay(date)).toBe(true)
  })
})

describe('curve bootstrap and key-rate risk', () => {
  const quotes = [
    { maturity: 1, rate: 0.03 },
    { maturity: 2, rate: 0.032 },
    { maturity: 3, rate: 0.034 },
    { maturity: 4, rate: 0.036 },
    { maturity: 5, rate: 0.037 },
  ]
  const curve = bootstrapFromParSwaps(quotes, 1)

  it('reprices the par swaps used to build it', () => {
    for (const quote of quotes) {
      const periods = quote.maturity
      const times = Array.from({ length: periods }, (_, i) => i + 1)
      const accruals = times.map(() => 1)
      expect(parSwapRate(times, accruals, curve)).toBeCloseTo(quote.rate, 10)
      expect(swapValue({ times, accruals, fixedRate: quote.rate }, curve)).toBeCloseTo(0, 10)
    }
  })

  it('produces a monotone-decreasing discount curve', () => {
    let previous = 1
    for (const time of curve.times) {
      const df = curve.discountFactor(time)
      expect(df).toBeLessThan(previous)
      previous = df
    }
  })

  it('key-rate DV01 via the AAD tape matches bump-and-revalue', () => {
    const times = curve.times
    const accruals = times.map(() => 1)
    const fixedRate = 0.035
    const maturityIndex = times.length - 1
    const result = swapKeyRateSensitivities(times, curve.zeroRates, accruals, fixedRate, maturityIndex)

    const pvAt = (rates: number[]): number => {
      let value = 1 - Math.exp(-rates[maturityIndex] * times[maturityIndex])
      for (let i = 0; i <= maturityIndex; i += 1) value -= fixedRate * accruals[i] * Math.exp(-rates[i] * times[i])
      return value
    }
    const bump = 1e-6
    for (let i = 0; i < times.length; i += 1) {
      const up = [...curve.zeroRates]
      const down = [...curve.zeroRates]
      up[i] += bump
      down[i] -= bump
      const fd = (pvAt(up) - pvAt(down)) / (2 * bump)
      expect(result.sensitivities[i]).toBeCloseTo(fd, 6)
    }
  })
})
