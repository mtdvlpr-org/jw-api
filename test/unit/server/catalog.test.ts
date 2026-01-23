import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { ReadableStream } from 'node:stream/web'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogRepository } from '../../../server/repository/catalog'
import { catalogService } from '../../../server/utils/catalog'

// Mocks
vi.mock('../../../server/repository/catalog')
vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('node:stream', async () => {
  return {
    Readable: {
      fromWeb: vi.fn()
    }
  }
})

// Globals
const logger = { debug: vi.fn() }
const decompressGzip = vi.fn()
const useStorage = vi.fn()
const formatDate = vi.fn()
const langCodeToMepsId = vi.fn()
const querySingleMock = vi.fn()
const queryMock = vi.fn()
const useDb = vi.fn(() => ({ query: queryMock, querySingle: querySingleMock }))

vi.stubGlobal('logger', logger)
vi.stubGlobal('decompressGzip', decompressGzip)
vi.stubGlobal('useStorage', useStorage)
vi.stubGlobal('formatDate', formatDate)
vi.stubGlobal('langCodeToMepsId', langCodeToMepsId)
vi.stubGlobal('useDb', useDb)

describe('catalog utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getCatalog', () => {
    it('should fetch and decompress catalog if missing', async () => {
      vi.mocked(catalogRepository.fetchManifest).mockResolvedValue({ current: 1 })
      vi.mocked(fs.existsSync).mockReturnValue(false)
      const mockStorage = { getItem: vi.fn(), setItem: vi.fn() }
      useStorage.mockReturnValue(mockStorage)
      const mockStream = new ReadableStream()
      vi.mocked(catalogRepository.fetchCatalog).mockResolvedValue(mockStream)

      await catalogService.getCatalog()

      expect(fsPromises.mkdir).toHaveBeenCalled()
      expect(catalogRepository.fetchCatalog).toHaveBeenCalledWith(1)
      expect(decompressGzip).toHaveBeenCalled()
      expect(mockStorage.setItem).toHaveBeenCalledWith('catalog_version', 1)
    })

    it('should skip if up to date', async () => {
      vi.mocked(catalogRepository.fetchManifest).mockResolvedValue({ current: 1 })
      vi.mocked(fs.existsSync).mockReturnValue(true) // Folder exists

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // folder
        .mockReturnValueOnce(true) // file

      const mockStorage = { getItem: vi.fn().mockResolvedValue(1), setItem: vi.fn() }
      useStorage.mockReturnValue(mockStorage)

      await catalogService.getCatalog()

      expect(catalogRepository.fetchCatalog).not.toHaveBeenCalled()
    })
  })

  describe('getPublicationForDate', () => {
    it('should return publication details', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      querySingleMock.mockResolvedValue({
        End: '2024-12-31',
        IssueTagNumber: 20240100,
        Start: '2024-01-01'
      })

      const result = await catalogService.getPublicationForDate('w', 'E')

      expect(result).toEqual({
        end: '2024-12-31',
        issue: '202401',
        langwritten: 'E',
        pub: 'w',
        start: '2024-01-01'
      })

      expect(useDb).toHaveBeenCalledWith('catalog')
      expect(querySingleMock).toHaveBeenCalled()
    })

    it('should return full issue number if it does not end in 00', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      querySingleMock.mockResolvedValue({
        End: '2024-12-31',
        IssueTagNumber: 20240115,
        Start: '2024-01-01'
      })

      const result = await catalogService.getPublicationForDate('w', 'E')

      expect(result).toEqual({
        end: '2024-12-31',
        issue: '20240115',
        langwritten: 'E',
        pub: 'w',
        start: '2024-01-01'
      })

      expect(useDb).toHaveBeenCalledWith('catalog')
      expect(querySingleMock).toHaveBeenCalled()
    })

    it('should throw error if query fails', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      querySingleMock.mockRejectedValue(new Error('SQL query failed.'))

      await expect(catalogService.getPublicationForDate('w')).rejects.toThrow('SQL query failed.')
    })

    it('should throw error if no rows returned', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      querySingleMock.mockRejectedValue(new Error('SQL query returned no rows.'))

      await expect(catalogService.getPublicationForDate('w')).rejects.toThrow(
        'SQL query returned no rows.'
      )
    })
  })
})
