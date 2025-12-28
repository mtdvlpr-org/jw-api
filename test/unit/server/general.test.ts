import { describe, expect, it, vi } from 'vitest'

import type { MediaItemFile } from '../../../shared/types/mediator'
import type { PublicationFetcher } from '../../../shared/types/pubMedia'

import {
  extractDateFromTitle,
  extractLangCode,
  extractMediaKey,
  extractResolution,
  findBestFile,
  findBestImage,
  formatIssue,
  generateMediaKey,
  generateVerseId,
  getStudyWatchtowerIssue,
  getWorkbookIssue,
  isJwLangCode,
  isMediaKey
} from '../../../server/utils/general'
import { jwLangCodes } from '../../../shared/types/lang.types'
import { imageSizes, imageTypes } from '../../../shared/types/media.types'

vi.stubGlobal('jwLangCodes', jwLangCodes)
vi.stubGlobal('imageTypes', imageTypes)
vi.stubGlobal('imageSizes', imageSizes)
vi.stubGlobal('createBadRequestError', (message: string) => new Error(message))

describe('jw general utils', () => {
  describe('isMediaKey', () => {
    it('should return true for docid-', () => {
      expect(isMediaKey('docid-123456')).toBe(true)
    })

    it('should return true for pub-', () => {
      expect(isMediaKey('pub-jw')).toBe(true)
    })

    it('should return false for other strings', () => {
      expect(isMediaKey('something-else')).toBe(false)
    })
  })

  describe('generateMediaKey', () => {
    it('should generate docid format', () => {
      const pub = {
        docid: 123456,
        track: 1
      } as unknown as PublicationFetcher
      expect(generateMediaKey(pub)).toBe('docid-123456_1')
    })

    it('should generate pub format', () => {
      const pub = {
        issue: 20230100,
        pub: 'w',
        track: 1
      } as unknown as PublicationFetcher
      expect(generateMediaKey(pub)).toBe('pub-w_202301_1')
    })

    it('should handle file formats', () => {
      const videoPub = {
        docid: 123,
        fileformat: 'MP4'
      } as unknown as PublicationFetcher
      expect(generateMediaKey(videoPub)).toBe('docid-123_VIDEO')

      const audioPub = {
        docid: 123,
        fileformat: 'MP3'
      } as unknown as PublicationFetcher
      expect(generateMediaKey(audioPub)).toBe('docid-123_AUDIO')

      const otherPub = {
        docid: 123,
        fileformat: 'PDF'
      } as unknown as PublicationFetcher
      expect(generateMediaKey(otherPub)).toBe('docid-123')
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

  describe('extractMediaKey', () => {
    it('should return input if it is a valid id', () => {
      expect(extractMediaKey('pub-jw')).toBe('pub-jw')
    })

    it('should extract from item param', () => {
      expect(extractMediaKey('https://mediator.jw.org/finder?item=pub-jwban')).toBe('pub-jwban')
    })

    it('should extract from lank param', () => {
      expect(extractMediaKey('https://jw.org/finder?lank=pub-jw')).toBe('pub-jw')
    })

    it('should extract from docid param', () => {
      expect(extractMediaKey('https://jw.org/finder?docid=docid-123')).toBe('docid-123')
    })

    it('should extract from path', () => {
      expect(extractMediaKey('https://jw.org/pub-jw')).toBe('pub-jw')
    })

    it('should extract from hash', () => {
      expect(extractMediaKey('https://jw.org/videos/#en/pub-jw')).toBe('pub-jw')
    })

    it('should return null if not found', () => {
      expect(extractMediaKey('https://jw.org')).toBe(null)
    })

    it('should return null on invalid input', () => {
      expect(extractMediaKey('not-a-url')).toBe(null)
    })
  })

  describe('generateVerseId', () => {
    it('should generate correct ID', () => {
      expect(generateVerseId(1, 1, 1)).toBe('1001001')
      expect(generateVerseId(66, 150, 176)).toBe('66150176')
    })
  })

  describe('extractResolution', () => {
    it('should extract resolution from label', () => {
      expect(extractResolution({ label: '720p' } as unknown as MediaItemFile)).toBe(720)
      expect(extractResolution({ label: '480p' } as unknown as MediaItemFile)).toBe(480)
    })

    it('should return 0 if no match', () => {
      expect(extractResolution({ label: 'HD' } as unknown as MediaItemFile)).toBe(0)
    })
  })

  describe('findBestFile', () => {
    const media = [
      { label: '480p', subtitles: { url: 'sub' } },
      { label: '720p' },
      { label: '360p' }
    ] as unknown as MediaItemFile[]

    it('should return null for empty list', () => {
      expect(findBestFile([])).toBe(null)
    })

    it('should return single item', () => {
      expect(findBestFile([media[0]])).toBe(media[0])
    })

    it('should sort by resolution', () => {
      // Should pick 720p as it is the highest resolution
      expect(findBestFile(media)).toEqual(media[1]) // 720p
    })

    it('should prioritize subtitles if requested', () => {
      expect(findBestFile(media, true)).toEqual(media[0]) // 480p has subtitles
    })
  })

  describe('findBestImage', () => {
    it('should return null for empty images', () => {
      expect(findBestImage({})).toBe(null)
    })

    it('should return highest priority image (wsr xl)', () => {
      const images = {
        sqr: { xl: 'sqr-xl' },
        wsr: { lg: 'wsr-lg', xl: 'wsr-xl' }
      }
      expect(findBestImage(images)).toBe('wsr-xl')
    })

    it('should fall back to smaller sizes if larger not available', () => {
      const images = {
        wsr: { sm: 'wsr-sm', xs: 'wsr-xs' }
      }
      expect(findBestImage(images)).toBe('wsr-sm')
    })

    it('should fall back to lower priority types if preferred type not available', () => {
      const images = {
        cvr: { xl: 'cvr-xl' },
        sqr: { xl: 'sqr-xl' }
      }
      expect(findBestImage(images)).toBe('sqr-xl')
    })

    it('should handle complex availability', () => {
      const images = {
        lsr: { sm: 'lsr-sm' },
        sqr: { xl: 'sqr-xl' }
      }

      expect(findBestImage(images)).toBe('lsr-sm')
    })
  })

  describe('extractDateFromTitle', () => {
    // 1. "Title (StartDay-EndDay Month)"
    it('should extract date from title with format "Title (StartDay-EndDay Month)"', () => {
      expect(extractDateFromTitle('Some title (1-7 January)')).toEqual({
        endDay: '7',
        endMonth: 'January',
        startDay: '1',
        startMonth: 'January'
      })
    })

    // 2. "Title (StartDay StartMonth-EndDay EndMonth)"
    it('should extract date from title with format "Title (StartDay StartMonth-EndDay EndMonth)"', () => {
      expect(extractDateFromTitle('Meeting (29 January-4 February)')).toEqual({
        endDay: '4',
        endMonth: 'February',
        startDay: '29',
        startMonth: 'January'
      })
    })

    // 3. "Title (Month StartDay-EndDay)"
    it('should extract date from title with format "Title (Month StartDay-EndDay)"', () => {
      expect(extractDateFromTitle('Meeting (January 1-7)')).toEqual({
        endDay: '7',
        endMonth: 'January',
        startDay: '1',
        startMonth: 'January'
      })
    })

    // 4. "Title (StartMonth StartDay-EndMonth EndDay)"
    it('should extract date from title with format "Title (StartMonth StartDay-EndMonth EndDay)"', () => {
      expect(extractDateFromTitle('Meeting (January 29-February 4)')).toEqual({
        endDay: '4',
        endMonth: 'February',
        startDay: '29',
        startMonth: 'January'
      })
    })

    it('should return null if no parentheses', () => {
      expect(extractDateFromTitle('Some title')).toBe(null)
    })

    it('should return null if parentheses are not at the end', () => {
      expect(extractDateFromTitle('(1-7 January) Some title')).toBe(null)
    })

    // 5. "Month StartDay-EndDay, Year: Title"
    it('should extract date from title with format "Month StartDay-EndDay, Year: Title"', () => {
      expect(extractDateFromTitle('January 10-12, 2024: Some Title')).toEqual({
        endDay: '12',
        endMonth: 'January',
        startDay: '10',
        startMonth: 'January',
        year: '2024'
      })
    })

    // 5b. "Month StartDay-EndDay Year: Title" (Optional comma)
    it('should extract date from title with format "Month StartDay-EndDay Year: Title"', () => {
      expect(extractDateFromTitle('January 10-12 2024: Some Title')).toEqual({
        endDay: '12',
        endMonth: 'January',
        startDay: '10',
        startMonth: 'January',
        year: '2024'
      })
    })

    // 6. "StartMonth StartDay-EndMonth EndDay, Year: Title"
    it('should extract date from title with format "StartMonth StartDay-EndMonth EndDay, Year: Title"', () => {
      expect(extractDateFromTitle('January 30-February 2, 2024: Some Title')).toEqual({
        endDay: '2',
        endMonth: 'February',
        startDay: '30',
        startMonth: 'January',
        year: '2024'
      })
    })

    // 6b. "StartMonth StartDay-EndMonth EndDay Year: Title" (Optional comma)
    it('should extract date from title with format "StartMonth StartDay-EndMonth EndDay Year: Title"', () => {
      expect(extractDateFromTitle('January 30-February 2 2024: Some Title')).toEqual({
        endDay: '2',
        endMonth: 'February',
        startDay: '30',
        startMonth: 'January',
        year: '2024'
      })
    })

    // 7. "StartDay-EndDay Month Year: Title"
    it('should extract date from title with format "StartDay-EndDay Month Year: Title"', () => {
      expect(extractDateFromTitle('10-12 January 2024: Some Title')).toEqual({
        endDay: '12',
        endMonth: 'January',
        startDay: '10',
        startMonth: 'January',
        year: '2024'
      })
    })

    // 8. "StartDay StartMonth-EndDay EndMonth Year: Title"
    it('should extract date from title with format "StartDay StartMonth-EndDay EndMonth Year: Title"', () => {
      expect(extractDateFromTitle('30 January-2 February 2024: Some Title')).toEqual({
        endDay: '2',
        endMonth: 'February',
        startDay: '30',
        startMonth: 'January',
        year: '2024'
      })
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
  })
})
