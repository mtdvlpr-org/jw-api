import { describe, expect, it, vi } from 'vitest'

import {
  extractLangCode,
  formatIssue,
  generateVerseId,
  getStudyWatchtowerIssue,
  getWorkbookIssue,
  isJwLangCode,
  isJwLangSymbol,
  langCodeToMepsId,
  pad
} from '../../../server/utils/general'
import { jwLangCodes, jwLangSymbols, mepsLanguageIds } from '../../../shared/types/lang.types'

vi.stubGlobal('jwLangCodes', jwLangCodes)
vi.stubGlobal('jwLangSymbols', jwLangSymbols)
vi.stubGlobal('mepsLanguageIds', mepsLanguageIds)
vi.stubGlobal('createBadRequestError', (message: string) => new Error(message))

describe('jw general utils', () => {
  describe('pad', () => {
    it('should pad number with zeros by default', () => {
      expect(pad(5)).toBe('05')
    })

    it('should pad string with zeros by default', () => {
      expect(pad('5')).toBe('05')
    })

    it('should support custom length', () => {
      expect(pad(5, 3)).toBe('005')
    })

    it('should support custom char', () => {
      expect(pad(5, 2, ' ')).toBe(' 5')
    })
  })

  describe('isJwLangCode', () => {
    it('should return true for valid codes', () => {
      expect(isJwLangCode('E')).toBe(true)
      expect(isJwLangCode('S')).toBe(true)
    })

    it('should return false for invalid codes', () => {
      expect(isJwLangCode('XYZ')).toBe(false)
    })
  })

  describe('isJwLangSymbol', () => {
    it('should return true for valid symbols', () => {
      expect(isJwLangSymbol('en')).toBe(true)
      expect(isJwLangSymbol('es')).toBe(true)
    })

    it('should return false for invalid symbols', () => {
      expect(isJwLangSymbol('xyz')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isJwLangSymbol(undefined)).toBe(false)
    })
  })

  describe('extractLangCode', () => {
    it('should return input if it is a valid code', () => {
      expect(extractLangCode('E')).toBe('E')
    })

    it('should extract from lang param', () => {
      expect(extractLangCode('https://mediator.jw.org/finder?lang=E')).toBe('E')
    })

    it('should extract from wtlocale param', () => {
      expect(extractLangCode('https://jw.org/finder?wtlocale=E')).toBe('E')
    })

    it('should extract from langwritten param', () => {
      expect(extractLangCode('https://jw.org?langwritten=S')).toBe('S')
    })

    it('should return null if not found', () => {
      expect(extractLangCode('https://jw.org')).toBe(null)
    })

    it('should return null on invalid input', () => {
      expect(extractLangCode('not-a-url')).toBe(null)
    })
  })

  describe('generateVerseId', () => {
    it('should generate correct ID', () => {
      expect(generateVerseId(1, 1, 1)).toBe('1001001')
      expect(generateVerseId(66, 150, 176)).toBe('66150176')
    })
  })

  describe('formatIssue', () => {
    it('should format date with day', () => {
      expect(formatIssue(2024, 1, 15)).toBe('20240115')
    })

    it('should format date without day', () => {
      expect(formatIssue(2024, 1)).toBe('202401')
    })

    it('should pad month and day correctly', () => {
      expect(formatIssue(2024, 5, 5)).toBe('20240505')
      expect(formatIssue(2024, 5)).toBe('202405')
    })
  })

  describe('getWorkbookIssue', () => {
    it('should throw error for pre-2016 years', () => {
      expect(() => getWorkbookIssue({ month: 1, year: 2015 })).toThrow(
        'Workbooks are not available before 2016.'
      )
    })

    it('should throw error for invalid months', () => {
      expect(() => getWorkbookIssue({ month: 0, year: 2024 })).toThrow(
        'Month must be between 1 and 12.'
      )
      expect(() => getWorkbookIssue({ month: 13, year: 2024 })).toThrow(
        'Month must be between 1 and 12.'
      )
    })

    it('should return monthly issue for pre-2021 years', () => {
      expect(getWorkbookIssue({ month: 1, year: 2020 })).toBe('202001')
      expect(getWorkbookIssue({ month: 12, year: 2016 })).toBe('201612')
    })

    it('should return bi-monthly issue for post-2021 years (odd month)', () => {
      expect(getWorkbookIssue({ month: 1, year: 2021 })).toBe('202101')
      expect(getWorkbookIssue({ month: 3, year: 2024 })).toBe('202403')
    })

    it('should return bi-monthly issue for post-2021 years (even month)', () => {
      expect(getWorkbookIssue({ month: 2, year: 2021 })).toBe('202101')
      expect(getWorkbookIssue({ month: 4, year: 2024 })).toBe('202403')
    })

    it('should return the current issue for the current month', () => {
      const today = new Date()
      expect(getWorkbookIssue()).toBe(
        getWorkbookIssue({ month: today.getMonth() + 1, year: today.getFullYear() })
      )
    })
  })

  describe('getStudyWatchtowerIssue', () => {
    it('should throw error for pre-2008 years', () => {
      expect(() => getStudyWatchtowerIssue({ month: 1, year: 2007 })).toThrow(
        'Study watchtower is not available before 2008.'
      )
    })

    it('should throw error for invalid months', () => {
      expect(() => getStudyWatchtowerIssue({ month: 0, year: 2024 })).toThrow(
        'Month must be between 1 and 12.'
      )
      expect(() => getStudyWatchtowerIssue({ month: 13, year: 2024 })).toThrow(
        'Month must be between 1 and 12.'
      )
    })

    it('should return 15th issue for pre-2016 years', () => {
      expect(getStudyWatchtowerIssue({ month: 1, year: 2015 })).toBe('20150115')
      expect(getStudyWatchtowerIssue({ month: 12, year: 2008 })).toBe('20081215')
    })

    it('should return monthly issue for post-2016 years', () => {
      expect(getStudyWatchtowerIssue({ month: 1, year: 2016 })).toBe('201601')
      expect(getStudyWatchtowerIssue({ month: 12, year: 2024 })).toBe('202412')
    })

    it('should return the current issue for the current month', () => {
      const today = new Date()
      expect(getStudyWatchtowerIssue()).toBe(
        getStudyWatchtowerIssue({ month: today.getMonth() + 1, year: today.getFullYear() })
      )
    })
  })

  describe('langCodeToMepsId', () => {
    it('should return correct MEPS ID for known language code', () => {
      expect(langCodeToMepsId('E')).toBe(0)
      expect(langCodeToMepsId('S')).toBe(1)
    })

    it('should return 0 for unknown language code', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(langCodeToMepsId('XYZ' as any)).toBe(0)
    })
  })
})
