import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bibleRepository } from '../../../server/repository/bible'
import { bibleService } from '../../../server/utils/bible'

// Mock defineCachedFunction BEFORE importing anything that uses it
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
  vi.stubGlobal('parseHtml', (html: string) => ({
    innerText: html,
    querySelector: vi.fn().mockReturnValue({ remove: vi.fn(), textContent: 'test' })
  }))
})

vi.mock('../../../server/repository/bible')

describe('bible utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getBooks', () => {
    it('should call fetchBibleData with default locale', async () => {
      const mockResult = { editionData: { books: [] } }
      vi.mocked(bibleRepository.fetchBibleData).mockResolvedValue(mockResult)

      const result = await bibleService.getBooks()

      expect(result).toEqual([])
      expect(bibleRepository.fetchBibleData).toHaveBeenCalledWith('en')
    })

    it('should call fetchBibleData with provided locale', async () => {
      const mockResult = { editionData: { books: [] } }
      vi.mocked(bibleRepository.fetchBibleData).mockResolvedValue(mockResult)

      const result = await bibleService.getBooks('es')

      expect(result).toEqual([])
      expect(bibleRepository.fetchBibleData).toHaveBeenCalledWith('es')
    })
  })

  describe('getBibleData', () => {
    it('should call fetchBibleData', async () => {
      const mockResult = { editionData: { books: [] } }
      vi.mocked(bibleRepository.fetchBibleData).mockResolvedValue(mockResult)

      const result = await bibleService.getBibleData('es')

      expect(result).toEqual(mockResult)
      expect(bibleRepository.fetchBibleData).toHaveBeenCalledWith('es')
    })
  })

  describe('getBook', () => {
    it('should call fetchBibleBook with default locale', async () => {
      const mockResult = { book: { title: 'Genesis' }, range: {} }
      vi.mocked(bibleRepository.fetchBibleBook).mockResolvedValue(mockResult)

      const result = await bibleService.getBook({ book: 1 })

      expect(result).toEqual(mockResult)
      expect(bibleRepository.fetchBibleBook).toHaveBeenCalledWith(1, 'en')
    })

    it('should call fetchBibleBook with provided locale', async () => {
      const mockResult = { book: { title: 'Genesis' }, range: {} }
      vi.mocked(bibleRepository.fetchBibleBook).mockResolvedValue(mockResult)

      const result = await bibleService.getBook({ book: 1, locale: 'es' })

      expect(result).toEqual(mockResult)
      expect(bibleRepository.fetchBibleBook).toHaveBeenCalledWith(1, 'es')
    })
  })

  describe('getChapter', () => {
    it('should call fetchBibleChapter', async () => {
      const mockResult = { verses: [] }
      vi.mocked(bibleRepository.fetchBibleChapter).mockResolvedValue(mockResult)

      const result = await bibleService.getChapter({ book: 1, chapter: 1, locale: 'fr' })

      expect(result).toEqual(mockResult)
      expect(bibleRepository.fetchBibleChapter).toHaveBeenCalledWith(1, 1, 'fr')
    })

    it('should use default locale if not provided', async () => {
      const mockResult = { verses: [] }
      vi.mocked(bibleRepository.fetchBibleChapter).mockResolvedValue(mockResult)

      await bibleService.getChapter({ book: 1, chapter: 1 })

      expect(bibleRepository.fetchBibleChapter).toHaveBeenCalledWith(1, 1, 'en')
    })
  })

  describe('getVerse', () => {
    it('should call fetchBibleVerse', async () => {
      const mockResult = { content: 'test' }
      vi.mocked(bibleRepository.fetchBibleVerse).mockResolvedValue(mockResult)

      const result = await bibleService.getVerse({ book: 1, chapter: 1, locale: 'de', verse: 1 })

      expect(result).toEqual({ parsedContent: 'test', result: mockResult })
      expect(bibleRepository.fetchBibleVerse).toHaveBeenCalledWith(1, 1, 1, 'de')
    })

    it('should use default locale if not provided', async () => {
      const mockResult = { content: 'test' }
      vi.mocked(bibleRepository.fetchBibleVerse).mockResolvedValue(mockResult)

      await bibleService.getVerse({ book: 1, chapter: 1, verse: 1 })

      expect(bibleRepository.fetchBibleVerse).toHaveBeenCalledWith(1, 1, 1, 'en')
    })
  })
})
