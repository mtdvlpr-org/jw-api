import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bibleRepository } from '../../../server/repository/bible'
import { jwRepository } from '../../../server/repository/jw'
import { mediatorRepository } from '../../../server/repository/mediator'
import { pubMediaRepository } from '../../../server/repository/pubMedia'
import { wolRepository } from '../../../server/repository/wol'
import { generateMediaKey, generateVerseId } from '../../../server/utils/general'

// Mock globals for tests since they are auto-imported in Nuxt but not here
const $fetch = vi.fn()
const scrapeBibleDataUrl = vi.fn()

vi.stubGlobal('$fetch', $fetch)
vi.stubGlobal('generateVerseId', generateVerseId)
vi.stubGlobal('generateMediaKey', generateMediaKey)
vi.stubGlobal('scrapeBibleDataUrl', scrapeBibleDataUrl)

describe('repository utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('jwRepository.fetchLanguages', () => {
    it('should fetch languages', async () => {
      const mockResult = { languages: [{ code: 'en', name: 'English' }] }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await jwRepository.fetchLanguages('en')
      expect(result).toEqual(mockResult.languages)
      expect($fetch).toHaveBeenCalledWith(
        '/en/languages/',
        expect.objectContaining({ baseURL: 'https://jw.org' })
      )
    })
  })

  describe('wolRepository.fetchYeartext', () => {
    it('should fetch yeartext', async () => {
      const mockResult = { content: 'God is love.' }
      vi.mocked($fetch).mockResolvedValue(mockResult)
      const year = 2024

      const result = await wolRepository.fetchYeartext('E', year)

      expect(result).toBe('God is love.')
      expect($fetch).toHaveBeenCalledWith(
        '/wol/finder',
        expect.objectContaining({
          baseURL: 'https://wol.jw.org',
          query: expect.objectContaining({
            docid: '1102024800',
            format: 'json',
            snip: 'yes',
            wtlocale: 'E'
          })
        })
      )
    })
  })

  describe('pubMediaRepository.fetchPublication', () => {
    it('should fetch publication details', async () => {
      const pubMock = { issue: 202401, langwritten: 'E', pub: 'w' } as const
      const mockApiResult = { pub: 'w', title: 'Watchtower' }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await pubMediaRepository.fetchPublication(pubMock)
      expect(result).toEqual(mockApiResult)
      expect($fetch).toHaveBeenCalledWith(
        '/GETPUBMEDIALINKS',
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/pub-media',
          query: expect.objectContaining({
            alllangs: '0',
            issue: 202401,
            langwritten: 'E',
            output: 'json',
            pub: 'w',
            txtCMSLang: 'E'
          })
        })
      )
    })
  })

  describe('mediatorRepository.fetchMediaItem', () => {
    it('should fetch media items', async () => {
      const pubMock = {
        fileformat: 'MP3',
        issue: 20240100,
        langwritten: 'E',
        pub: 'w',
        track: 1
      } as const
      const mockMediaItem = { guid: '123' }
      const mockApiResult = { media: [mockMediaItem] }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await mediatorRepository.fetchMediaItem(pubMock)

      expect(result).toEqual(mockMediaItem)

      expect($fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/media-items\/E\/pub-w_202401_1_AUDIO/),
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1',
          query: expect.objectContaining({
            clientType: 'www'
          })
        })
      )
    })
  })

  describe('mediatorRepository.fetchCategories', () => {
    it('should fetch categories', async () => {
      const locale = 'E'
      const clientType = 'www'
      const mockCategories = [{ key: 'Audio', name: 'Audio' }]
      const mockResult = { categories: mockCategories }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await mediatorRepository.fetchCategories(locale, clientType)

      expect(result).toEqual(mockCategories)
      expect($fetch).toHaveBeenCalledWith(
        `/categories/${locale}`,
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1',
          query: expect.objectContaining({
            clientType
          })
        })
      )
    })
  })

  describe('mediatorRepository.fetchCategory', () => {
    it('should fetch category', async () => {
      const locale = 'E'
      const key = 'Audio'
      const mockCategory = { key: 'Audio', name: 'Audio' }
      const mockResult = { category: mockCategory }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await mediatorRepository.fetchCategory(locale, key)

      expect(result).toEqual(mockCategory)
      expect($fetch).toHaveBeenCalledWith(
        `/categories/${locale}/${key}`,
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })
  })

  describe('mediatorRepository.fetchCategoryDetails', () => {
    it('should fetch category details', async () => {
      const locale = 'E'
      const key = 'Audio'
      const mockCategory = { key: 'Audio', name: 'Audio' }
      const mockResult = { category: mockCategory }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await mediatorRepository.fetchCategoryDetails(locale, key)

      expect(result).toEqual(mockCategory)
      expect($fetch).toHaveBeenCalledWith(
        `/categories/${locale}/${key}`,
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1',
          query: expect.objectContaining({
            detailed: 1
          })
        })
      )
    })
  })

  describe('mediatorRepository.fetchLanguages', () => {
    it('should fetch languages', async () => {
      const locale = 'E'
      const mockLanguages = [{ code: 'E', name: 'English' }]
      const mockResult = { languages: mockLanguages }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await mediatorRepository.fetchLanguages(locale)

      expect(result).toEqual(mockLanguages)
      expect($fetch).toHaveBeenCalledWith(
        `/languages/${locale}/web`,
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })
  })

  describe('mediatorRepository.fetchTranslations', () => {
    it('should fetch translations', async () => {
      const locale = 'E'
      const mockTranslations = { E: { hello: 'Hello' } }
      const mockResult = { translations: mockTranslations }
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await mediatorRepository.fetchTranslations(locale)

      expect(result).toEqual(mockTranslations[locale])
      expect($fetch).toHaveBeenCalledWith(
        `/translations/${locale}`,
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })
  })

  describe('bibleRepository.fetchBibleChapter', () => {
    it('should fetch bible chapter', async () => {
      const book = 1
      const chapter = 1
      const locale = 'en'
      const mockUrl = 'https://mock-url'
      const verseIdStart = '1001001'
      const verseIdEnd = '1001999'
      const range = `${verseIdStart}-${verseIdEnd}`
      const mockChapter = { verses: [{ content: 'In the beginning...' }] }
      const mockResult = {
        ranges: {
          [range]: mockChapter
        }
      }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(mockUrl)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await bibleRepository.fetchBibleChapter(book, chapter, locale)

      expect(result).toEqual(mockChapter)
      expect(scrapeBibleDataUrl).toHaveBeenCalledWith(locale)
      expect($fetch).toHaveBeenCalledWith(`${mockUrl}/${range}`)
    })
  })

  describe('bibleRepository.fetchBibleData', () => {
    it('should fetch bible data', async () => {
      const locale = 'en'
      const mockUrl = 'https://mock-url'
      const mockResult = { books: [] }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(mockUrl)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await bibleRepository.fetchBibleData(locale)

      expect(result).toEqual(mockResult)
      expect(scrapeBibleDataUrl).toHaveBeenCalledWith(locale)
      expect($fetch).toHaveBeenCalledWith(mockUrl)
    })
  })

  describe('bibleRepository.fetchBibleVerse', () => {
    it('should fetch bible verse', async () => {
      const book = 1
      const chapter = 1
      const verseNumber = 1
      const locale = 'en'
      const mockUrl = 'https://mock-url'
      const verseId = '1001001'
      const mockVerse = { content: 'In the beginning...' }
      const mockResult = {
        ranges: {
          [verseId]: {
            verses: [mockVerse]
          }
        }
      }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(mockUrl)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await bibleRepository.fetchBibleVerse(book, chapter, verseNumber, locale)

      expect(result).toEqual(mockVerse)
      expect($fetch).toHaveBeenCalledWith(`${mockUrl}/${verseId}`)
    })
  })
})
