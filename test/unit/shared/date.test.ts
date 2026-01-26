import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatDate, getMondayOfWeek, getWeekOfYear, parseDate } from '../../../shared/utils/date'
import { pad } from '../../../shared/utils/general'

// Stub globals
vi.stubGlobal('pad', pad)
vi.stubGlobal('apiBadRequestError', (msg: string) => new Error(msg))
describe('date utils', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getWeekOfYear', () => {
    it('should return correct week for a specific date', () => {
      const date = { day: 4, month: 1, year: 2024 }
      const result = getWeekOfYear(date)
      expect(result).toEqual({ week: 1, year: 2024 })
    })

    it('should return current week if no date provided', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2024, 0, 4)))
      const result = getWeekOfYear()
      expect(result).toEqual({ week: 1, year: 2024 })
    })

    it('should handle week crossing years', () => {
      const result = getWeekOfYear({ day: 1, month: 1, year: 2023 })
      expect(result).toEqual({ week: 52, year: 2022 })
    })
  })

  describe('getMondayOfWeek', () => {
    it('should return Monday of specific week', () => {
      const week = { week: 1, year: 2024 }
      const monday = getMondayOfWeek(week)
      expect(monday.toISOString().split('T')[0]).toBe('2024-01-01')
    })

    it('should handle Jan 4th being a Sunday', () => {
      const week = { week: 3, year: 2015 }
      const monday = getMondayOfWeek(week)
      expect(monday.toISOString().split('T')[0]).toBe('2015-01-12')
    })

    it('should return Monday of current week if no date provided', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2024, 0, 4)))
      const monday = getMondayOfWeek()
      expect(monday.toISOString().split('T')[0]).toBe('2024-01-01')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(Date.UTC(2024, 0, 1))
      expect(formatDate(date)).toBe('2024-01-01')
    })

    it('should default to current date', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2024, 11, 31)))
      expect(formatDate()).toBe('2024-12-31')
    })

    it('should format date as YYYY/MM/DD', () => {
      const date = new Date(Date.UTC(2024, 0, 1))
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/01')
    })

    it('should format date as YYYYMMDD', () => {
      const date = new Date(Date.UTC(2024, 0, 1))
      expect(formatDate(date, 'YYYYMMDD')).toBe('20240101')
    })

    it('should throw error for unsupported format', () => {
      expect(() => formatDate(new Date(), 'unsupported' as 'YYYY-MM-DD')).toThrow(
        'Invalid date format: unsupported'
      )
    })
  })

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD format', () => {
      const date = parseDate('2024-01-30')
      expect(date.toISOString().split('T')[0]).toBe('2024-01-30')
    })

    it('should parse YYYY/MM/DD format', () => {
      const date = parseDate('2024/01/30')
      expect(date.toISOString().split('T')[0]).toBe('2024-01-30')
    })

    it('should parse YYYYMMDD format', () => {
      const date = parseDate('20240130')
      expect(date.toISOString().split('T')[0]).toBe('2024-01-30')
    })

    it('should throw error for invalid format', () => {
      expect(() => parseDate('invalid-date')).toThrow('Invalid date format: invalid-date')
    })
  })
})
