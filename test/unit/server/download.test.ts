import { beforeEach, describe, expect, it, vi } from 'vitest'

import { downloadRepository } from '../../../server/repository/download'

// Mock defineCachedFunction and globals BEFORE imports
const { mockFetch } = vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)

  const mockToFetchApiError = vi.fn((error: unknown, context: { notFoundMessage: string }) => {
    const err = new Error(context.notFoundMessage) as Error & { statusCode: number }
    err.statusCode = 404
    return err
  })

  const mockFetch = vi.fn()

  vi.stubGlobal('toFetchApiError', mockToFetchApiError)
  vi.stubGlobal('$fetch', mockFetch)

  return { mockFetch, mockToFetchApiError }
})

describe('downloadRepository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('arrayBuffer', () => {
    it('should download content as ArrayBuffer', async () => {
      const mockUrl = 'https://example.com/file.bin'
      const mockBuffer = new ArrayBuffer(8)

      mockFetch.mockResolvedValue(mockBuffer)

      const result = await downloadRepository.arrayBuffer(mockUrl)

      expect(result).toBe(mockBuffer)
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'arrayBuffer' })
    })

    it('should pass additional options to $fetch', async () => {
      const mockUrl = 'https://example.com/file.bin'
      const mockBuffer = new ArrayBuffer(8)
      const options = { headers: { Authorization: 'Bearer token' } }

      mockFetch.mockResolvedValue(mockBuffer)

      await downloadRepository.arrayBuffer(mockUrl, options)

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        headers: { Authorization: 'Bearer token' },
        responseType: 'arrayBuffer'
      })
    })

    it('should throw error on download failure', async () => {
      const mockUrl = 'https://example.com/missing.bin'

      mockFetch.mockRejectedValue(new Error('Not found'))

      await expect(downloadRepository.arrayBuffer(mockUrl)).rejects.toThrow(
        "Resource not found at 'https://example.com/missing.bin'"
      )
    })
  })

  describe('blob', () => {
    it('should download content as Blob', async () => {
      const mockUrl = 'https://example.com/file.pdf'
      const mockBlob = new Blob(['test'], { type: 'application/pdf' })

      mockFetch.mockResolvedValue(mockBlob)

      const result = await downloadRepository.blob(mockUrl)

      expect(result).toBe(mockBlob)
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'blob' })
    })

    it('should pass additional options to $fetch', async () => {
      const mockUrl = 'https://example.com/file.pdf'
      const mockBlob = new Blob(['test'])
      const options = { timeout: 5000 }

      mockFetch.mockResolvedValue(mockBlob)

      await downloadRepository.blob(mockUrl, options)

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'blob', timeout: 5000 })
    })

    it('should throw error on download failure', async () => {
      const mockUrl = 'https://example.com/missing.pdf'

      mockFetch.mockRejectedValue(new Error('Not found'))

      await expect(downloadRepository.blob(mockUrl)).rejects.toThrow(
        "Resource not found at 'https://example.com/missing.pdf'"
      )
    })
  })

  describe('stream', () => {
    it('should download content as stream', async () => {
      const mockUrl = 'https://example.com/file.zip'
      const mockStream = new ReadableStream()

      mockFetch.mockResolvedValue(mockStream)

      const result = await downloadRepository.stream(mockUrl)

      expect(result).toBe(mockStream)
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'stream' })
    })

    it('should pass additional options to $fetch', async () => {
      const mockUrl = 'https://example.com/file.zip'
      const mockStream = new ReadableStream()
      const options = { retry: 3 }

      mockFetch.mockResolvedValue(mockStream)

      await downloadRepository.stream(mockUrl, options)

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'stream', retry: 3 })
    })

    it('should throw error on download failure', async () => {
      const mockUrl = 'https://example.com/missing.zip'

      mockFetch.mockRejectedValue(new Error('Not found'))

      await expect(downloadRepository.stream(mockUrl)).rejects.toThrow(
        "Resource not found at 'https://example.com/missing.zip'"
      )
    })
  })

  describe('text', () => {
    it('should download content as text', async () => {
      const mockUrl = 'https://example.com/file.txt'
      const mockText = 'Hello, World!'

      mockFetch.mockResolvedValue(mockText)

      const result = await downloadRepository.text(mockUrl)

      expect(result).toBe(mockText)
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, { responseType: 'text' })
    })

    it('should pass additional options to $fetch', async () => {
      const mockUrl = 'https://example.com/file.txt'
      const mockText = 'Test content'
      const options = { headers: { 'Accept-Language': 'en-US' } }

      mockFetch.mockResolvedValue(mockText)

      await downloadRepository.text(mockUrl, options)

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        headers: { 'Accept-Language': 'en-US' },
        responseType: 'text'
      })
    })

    it('should throw error on download failure', async () => {
      const mockUrl = 'https://example.com/missing.txt'

      mockFetch.mockRejectedValue(new Error('Not found'))

      await expect(downloadRepository.text(mockUrl)).rejects.toThrow(
        "Resource not found at 'https://example.com/missing.txt'"
      )
    })

    it('should handle empty text response', async () => {
      const mockUrl = 'https://example.com/empty.txt'

      mockFetch.mockResolvedValue('')

      const result = await downloadRepository.text(mockUrl)

      expect(result).toBe('')
    })
  })
})
