import { beforeEach, describe, expect, it, vi } from 'vitest'

import { downloadRepository } from '../../../server/repository/download'
import { jwpubService } from '../../../server/utils/jwpub'

// Mock defineCachedFunction BEFORE importing anything that uses it
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
})

// Mocks
vi.mock('../../../server/repository/download')

// Globals
const extractZipFiles = vi.fn()
const loadDatabase = vi.fn()
const queryDatabaseSingle = vi.fn()
const formatDate = vi.fn()
const parseHtml = vi.fn()
const createNotFoundError = vi.fn((msg) => new Error(msg))
const createInternalServerError = vi.fn((msg, cause) => {
  const err = new Error(msg)
  err.cause = cause
  return err
})
const logger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
}

vi.stubGlobal('extractZipFiles', extractZipFiles)
vi.stubGlobal('loadDatabase', loadDatabase)
vi.stubGlobal('queryDatabaseSingle', queryDatabaseSingle)
vi.stubGlobal('formatDate', formatDate)
vi.stubGlobal('parseHtml', parseHtml)
vi.stubGlobal('createNotFoundError', createNotFoundError)
vi.stubGlobal('createInternalServerError', createInternalServerError)
vi.stubGlobal('logger', logger)

describe('jwpub utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getDatabase', () => {
    it('should download and extract database', async () => {
      const url = 'http://example.com/pub.jwpub'
      const buffer = new ArrayBuffer(0)
      vi.mocked(downloadRepository.arrayBuffer).mockResolvedValue(buffer)

      const mockDbFile = { async: vi.fn().mockResolvedValue(new Uint8Array()) }

      // Setup extractZipFiles to handle two calls: outer and inner
      extractZipFiles
        .mockResolvedValueOnce({
          files: {
            contents: { async: vi.fn().mockResolvedValue(new Uint8Array()) }
          }
        })
        .mockResolvedValueOnce({
          files: {
            'data.db': mockDbFile
          }
        })

      const mockSqlDb = {}
      loadDatabase.mockResolvedValue(mockSqlDb)

      const result = await jwpubService.getDatabase(url)

      expect(downloadRepository.arrayBuffer).toHaveBeenCalledWith(url)
      expect(extractZipFiles).toHaveBeenCalledTimes(2)
      expect(loadDatabase).toHaveBeenCalled()
      expect(result).toBe(mockSqlDb)
    })

    it('should throw error if no db file found', async () => {
      vi.mocked(downloadRepository.arrayBuffer).mockResolvedValue(new ArrayBuffer(0))
      extractZipFiles
        .mockResolvedValueOnce({
          files: { contents: { async: vi.fn().mockResolvedValue(new Uint8Array()) } }
        })
        .mockResolvedValueOnce({
          files: { 'image.jpg': {} }
        })

      await expect(jwpubService.getDatabase('url')).rejects.toThrow(
        'Failed to get database from URL.'
      )
    })
  })

  describe('getWtArticleForDate', () => {
    it('should fetch database and query article details', async () => {
      const mockDb = {}
      // We can spy on getDatabase if we export it or use the service object, but getWtArticleForDate calls the internal getDatabase function
      // Since getDatabase relies on global mocks, we can just let it run or mock the globals to make it return fast.
      // Or we can assume getDatabase works (tested above) and just mock the dependencies it calls.

      // Let's mock the internal calls for getDatabase to succeed
      vi.mocked(downloadRepository.arrayBuffer).mockResolvedValue(new ArrayBuffer(0))
      extractZipFiles
        .mockResolvedValueOnce({ files: { contents: { async: vi.fn() } } })
        .mockResolvedValueOnce({ files: { 'data.db': { async: vi.fn() } } })
      loadDatabase.mockResolvedValue(mockDb)

      formatDate.mockImplementation((d) => (d === '20240107' ? '20240107' : '20240101'))

      // Mock queryDatabaseSingle responses
      // First call for DatedText
      queryDatabaseSingle.mockReturnValueOnce({
        BeginParagraphOrdinal: 1,
        DocumentId: 100,
        EndParagraphOrdinal: 5,
        FirstDateOffset: '20240101',
        LastDateOffset: '20240107'
      })
      // Second call for Caption
      queryDatabaseSingle.mockReturnValueOnce({
        Caption: '<caption>Title</caption>'
      })

      parseHtml.mockReturnValue({
        innerText: 'Title',
        querySelector: vi.fn().mockReturnValue({ innerText: 'Parsed Title' })
      })

      const result = await jwpubService.getWtArticleForDate('url', new Date())

      expect(result).toEqual({
        end: '20240107',
        start: '20240101',
        title: 'Parsed Title'
      })
    })
  })

  describe('getMwbArticleForDate', () => {
    it('should fetch database and query mwb article details', async () => {
      const mockDb = {}
      vi.mocked(downloadRepository.arrayBuffer).mockResolvedValue(new ArrayBuffer(0))
      extractZipFiles
        .mockResolvedValueOnce({ files: { contents: { async: vi.fn() } } })
        .mockResolvedValueOnce({ files: { 'data.db': { async: vi.fn() } } })
      loadDatabase.mockResolvedValue(mockDb)

      formatDate.mockImplementation((d) => (d === '20240107' ? '20240107' : '20240101'))

      queryDatabaseSingle.mockReturnValueOnce({
        Caption: '<caption>MWB Title</caption>',
        FirstDateOffset: '20240101',
        LastDateOffset: '20240107'
      })

      parseHtml.mockReturnValue({
        innerText: 'MWB Title',
        querySelector: vi.fn().mockReturnValue({ innerText: 'Parsed MWB Title' })
      })

      const result = await jwpubService.getMwbArticleForDate('url', new Date())

      expect(result).toEqual({
        end: '20240107',
        start: '20240101',
        title: 'Parsed MWB Title'
      })
    })
  })
})
