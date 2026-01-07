import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bibleRepository } from '../../../server/repository/bible'
import { catalogRepository } from '../../../server/repository/catalog'
import { downloadRepository } from '../../../server/repository/download'
import { jwRepository } from '../../../server/repository/jw'
import { mediatorRepository } from '../../../server/repository/mediator'
import { pubMediaRepository } from '../../../server/repository/pubMedia'
import { wolRepository } from '../../../server/repository/wol'
import { generateVerseId } from '../../../server/utils/general'
import { generateMediaKey } from '../../../server/utils/media'

// Mock globals for tests since they are auto-imported in Nuxt but not here
const { $fetch, createNotFoundError, scrapeBibleDataUrl } = vi.hoisted(() => {
  const $fetch = vi.fn()
  const scrapeBibleDataUrl = vi.fn()
  const createNotFoundError = vi.fn((msg) => new Error(msg))

  vi.stubGlobal('$fetch', $fetch)
  vi.stubGlobal('scrapeBibleDataUrl', scrapeBibleDataUrl)
  vi.stubGlobal('createNotFoundError', createNotFoundError)
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)

  return { $fetch, createNotFoundError, scrapeBibleDataUrl }
})

vi.stubGlobal('generateVerseId', generateVerseId)
vi.stubGlobal('generateMediaKey', generateMediaKey)

describe('repository utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('downloadRepository', () => {
    describe('arrayBuffer', () => {
      it('should download as arrayBuffer', async () => {
        const url = 'http://example.com/file'
        const mockData = new ArrayBuffer(8)
        vi.mocked($fetch).mockResolvedValue(mockData)

        const result = await downloadRepository.arrayBuffer(url)

        expect(result).toBe(mockData)
        expect($fetch).toHaveBeenCalledWith(url, { responseType: 'arrayBuffer' })
      })
    })

    describe('blob', () => {
      it('should download as blob', async () => {
        const url = 'http://example.com/file'
        const mockData = new Blob(['test'])
        vi.mocked($fetch).mockResolvedValue(mockData)

        const result = await downloadRepository.blob(url)

        expect(result).toBe(mockData)
        expect($fetch).toHaveBeenCalledWith(url, { responseType: 'blob' })
      })
    })

    describe('stream', () => {
      it('should download as stream', async () => {
        const url = 'http://example.com/file'
        const mockData = {} // Mock stream object
        vi.mocked($fetch).mockResolvedValue(mockData)

        const result = await downloadRepository.stream(url)

        expect(result).toBe(mockData)
        expect($fetch).toHaveBeenCalledWith(url, { responseType: 'stream' })
      })
    })

    describe('text', () => {
      it('should download as text', async () => {
        const url = 'http://example.com/file'
        const mockData = 'test content'
        vi.mocked($fetch).mockResolvedValue(mockData)

        const result = await downloadRepository.text(url)

        expect(result).toBe(mockData)
        expect($fetch).toHaveBeenCalledWith(url, { responseType: 'text' })
      })
    })
  })

  describe('catalogRepository.fetchCatalog', () => {
    it('should fetch catalog stream', async () => {
      const mockStream = { pipe: vi.fn() }
      vi.mocked($fetch).mockResolvedValue(mockStream)
      const id = '123'

      const result = await catalogRepository.fetchCatalog(id)

      expect(result).toEqual(mockStream)
      expect($fetch).toHaveBeenCalledWith(
        `/${id}/catalog.db.gz`,
        expect.objectContaining({
          baseURL: 'https://app.jw-cdn.org/catalogs/publications/v4',
          responseType: 'stream'
        })
      )
    })
  })

  describe('catalogRepository.fetchManifest', () => {
    it('should fetch manifest', async () => {
      const mockManifest = { current: 1 }
      vi.mocked($fetch).mockResolvedValue(mockManifest)

      const result = await catalogRepository.fetchManifest()

      expect(result).toEqual(mockManifest)
      expect($fetch).toHaveBeenCalledWith(
        '/manifest.json',
        expect.objectContaining({
          baseURL: 'https://app.jw-cdn.org/catalogs/publications/v4'
        })
      )
    })
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
            docid: `110${year}800`,
            format: 'json',
            snip: 'yes',
            wtlocale: 'E'
          })
        })
      )
    })
  })

  describe('wolRepository.fetchYeartextDetails', () => {
    it('should fetch yeartext details (cache miss)', async () => {
      const year = 2040
      const wtlocale = 'E'
      const jsonUrl = `https://wol.jw.org/en/wol/dt/r1/lp-e/${year}/1/1`
      const finderResult = { jsonUrl }
      const detailsResult = { title: 'God is love.' }

      vi.mocked($fetch).mockResolvedValueOnce(finderResult).mockResolvedValueOnce(detailsResult)

      const result = await wolRepository.fetchYeartextDetails(wtlocale, year)

      expect(result).toEqual(detailsResult)
      expect($fetch).toHaveBeenNthCalledWith(
        1,
        '/wol/finder',
        expect.objectContaining({
          query: expect.objectContaining({
            docid: `110${year}800`,
            wtlocale
          })
        })
      )
      expect($fetch).toHaveBeenNthCalledWith(
        2,
        jsonUrl,
        expect.objectContaining({
          baseURL: 'https://wol.jw.org'
        })
      )
    })

    it('should use cached URL for subsequent calls', async () => {
      const year = 2041
      const wtlocale = 'E'
      const jsonUrl = `https://wol.jw.org/en/wol/dt/r1/lp-e/${year}/1/1`
      const finderResult = { jsonUrl }
      const detailsResult = { title: 'Faith is power.' }

      vi.mocked($fetch)
        .mockResolvedValueOnce(finderResult)
        .mockResolvedValueOnce(detailsResult)
        .mockResolvedValueOnce(detailsResult)

      // First call (cache miss)
      await wolRepository.fetchYeartextDetails(wtlocale, year)

      // Second call (cache hit)
      const result = await wolRepository.fetchYeartextDetails(wtlocale, year)

      expect(result).toEqual(detailsResult)
      // Expect 3 calls total: 1 finder, 1 details (first), 1 details (second)
      expect($fetch).toHaveBeenCalledTimes(3)
      expect($fetch).toHaveBeenLastCalledWith(
        jsonUrl,
        expect.objectContaining({
          baseURL: 'https://wol.jw.org'
        })
      )
    })
  })

  describe('pubMediaRepository.fetchPublication', () => {
    it('should fetch publication details with PublicationFetcher params', async () => {
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

    it('should fetch publication details with PublicationDocFetcher params', async () => {
      const pubMock = { docid: 12345, langwritten: 'E' } as const
      const mockApiResult = { docid: 12345, title: 'Article Title' }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await pubMediaRepository.fetchPublication(pubMock)
      expect(result).toEqual(mockApiResult)
      expect($fetch).toHaveBeenCalledWith(
        '/GETPUBMEDIALINKS',
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/pub-media',
          query: expect.objectContaining({
            alllangs: '0',
            docid: 12345,
            langwritten: 'E',
            output: 'json',
            txtCMSLang: 'E'
          })
        })
      )
    })

    it('should fetch publication details with PublicationBibleFetcher params', async () => {
      const pubMock = { booknum: 1, langwritten: 'E', pub: 'nwt' } as const
      const mockApiResult = { booknum: 1, pub: 'nwt', title: 'Genesis' }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await pubMediaRepository.fetchPublication(pubMock)
      expect(result).toEqual(mockApiResult)
      expect($fetch).toHaveBeenCalledWith(
        '/GETPUBMEDIALINKS',
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/pub-media',
          query: expect.objectContaining({
            alllangs: '0',
            booknum: 1,
            langwritten: 'E',
            output: 'json',
            pub: 'nwt',
            txtCMSLang: 'E'
          })
        })
      )
    })
  })

  describe('mediatorRepository.fetchMediaItem', () => {
    it('should fetch media items with PublicationFetcher', async () => {
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
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })

    it('should fetch media items with DocFetcher', async () => {
      const pubMock = {
        docid: 12345,
        langwritten: 'E'
      } as const
      const mockMediaItem = { guid: '123' }
      const mockApiResult = { media: [mockMediaItem] }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await mediatorRepository.fetchMediaItem(pubMock)

      expect(result).toEqual(mockMediaItem)

      expect($fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/media-items\/E\/docid-12345/),
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })

    it('should fetch media items with key/langwritten params', async () => {
      const pubMock = {
        key: 'pub-w_202401_1_AUDIO',
        langwritten: 'E'
      } as const
      const mockMediaItem = { guid: '123' }
      const mockApiResult = { media: [mockMediaItem] }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      const result = await mediatorRepository.fetchMediaItem(pubMock)

      expect(result).toEqual(mockMediaItem)

      expect($fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/media-items\/E\/pub-w_202401_1_AUDIO/),
        expect.objectContaining({
          baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
        })
      )
    })

    it('should throw error if media item is not found', async () => {
      const pubMock = {
        key: 'pub-w_202401_1_AUDIO',
        langwritten: 'E'
      } as const
      const mockApiResult = { media: [] }
      vi.mocked($fetch).mockResolvedValue(mockApiResult)

      await expect(mediatorRepository.fetchMediaItem(pubMock)).rejects.toThrow(
        'Could not find media item.'
      )
      expect(createNotFoundError).toHaveBeenCalledWith('Could not find media item.', {
        key: 'pub-w_202401_1_AUDIO',
        publication: pubMock
      })
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

  describe('bibleRepository.fetchBibleBook', () => {
    it('should fetch book data successfully', async () => {
      const locale = 'en'
      const book = 1
      const url = 'https://example.com/api'
      const mockResult = {
        editionData: {
          books: {
            1: { title: 'Genesis' }
          }
        },
        ranges: {
          '1001001-1017002': { someData: 'test' }
        }
      }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(url)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      const result = await bibleRepository.fetchBibleBook(book, locale)

      expect(scrapeBibleDataUrl).toHaveBeenCalledWith(locale)
      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining(url),
        expect.objectContaining({
          retry: 2
        })
      )
      expect(result).toEqual({
        book: { title: 'Genesis' },
        range: { someData: 'test' }
      })
    })

    it('should throw error if book data not found', async () => {
      const locale = 'en'
      const book = 1
      const url = 'https://example.com/api'
      const mockResult = {
        editionData: {
          books: {
            1: { title: 'Genesis' }
          }
        },
        ranges: {} // Empty ranges
      }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(url)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      await expect(bibleRepository.fetchBibleBook(book, locale)).rejects.toThrow(
        'Could not find book data.'
      )

      expect(createNotFoundError).toHaveBeenCalledWith('Could not find book data.', {
        book,
        locale
      })
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
      expect($fetch).toHaveBeenCalledWith(`${mockUrl}/${range}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)'
        },
        retry: 2,
        retryDelay: 1000,
        timeout: 30000
      })
    })

    it('should throw error if chapter data is not found', async () => {
      const book = 1
      const chapter = 1
      const locale = 'en'
      const mockUrl = 'https://mock-url'
      const mockResult = { ranges: {} }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(mockUrl)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      await expect(bibleRepository.fetchBibleChapter(book, chapter, locale)).rejects.toThrow(
        'Could not find chapter data.'
      )
      expect(createNotFoundError).toHaveBeenCalledWith('Could not find chapter data.', {
        book,
        chapter,
        locale
      })
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
      expect($fetch).toHaveBeenCalledWith(mockUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)'
        },
        retry: 2,
        retryDelay: 1000,
        timeout: 30000
      })
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
      expect($fetch).toHaveBeenCalledWith(`${mockUrl}/${verseId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)'
        },
        retry: 2,
        retryDelay: 1000,
        timeout: 30000
      })
    })

    it('should throw error if verse data is not found', async () => {
      const book = 1
      const chapter = 1
      const verseNumber = 1
      const locale = 'en'
      const mockUrl = 'https://mock-url'
      const mockResult = { ranges: {} }

      vi.mocked(scrapeBibleDataUrl).mockResolvedValue(mockUrl)
      vi.mocked($fetch).mockResolvedValue(mockResult)

      await expect(
        bibleRepository.fetchBibleVerse(book, chapter, verseNumber, locale)
      ).rejects.toThrow('Could not find verse data.')
      expect(createNotFoundError).toHaveBeenCalledWith('Could not find verse data.', {
        book,
        chapter,
        locale,
        verseNumber
      })
    })
  })
})
