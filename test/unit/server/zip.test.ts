import fs from 'node:fs'
import { PassThrough, Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'
import unzipper from 'unzipper'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { decompressGzip, extractFileFromZip, extractFilesFromZip } from '../../../server/utils/zip'

vi.mock('node:fs')
vi.mock('node:zlib')
vi.mock('node:stream/promises')

describe('zip utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('decompressGzip', () => {
    it('should pipeline stream through gunzip to file', async () => {
      const mockStream = new Readable()
      const outputPath = 'output.txt'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockGunzip = { on: vi.fn() } as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockWriteStream = { on: vi.fn() } as any

      vi.mocked(zlib.createGunzip).mockReturnValue(mockGunzip)
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream)
      vi.mocked(pipeline).mockResolvedValue(undefined)

      await decompressGzip(mockStream, outputPath)

      expect(zlib.createGunzip).toHaveBeenCalled()
      expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath)
      expect(pipeline).toHaveBeenCalledWith(mockStream, mockGunzip, mockWriteStream)
    })
  })

  describe('extractFileFromZip', () => {
    it('should extract a file matching exact name', async () => {
      const mockStream = new PassThrough()
      const testData = Buffer.from('test data')

      // Create a mock entry
      const mockEntry = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry.path = 'test.db'
      mockEntry.autodrain = vi.fn()

      // Mock the unzipper.Parse() to return a stream
      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      // Start the extraction
      const extractPromise = extractFileFromZip(mockStream, 'test.db')

      // Emit the entry event
      parseStream.emit('entry', mockEntry)

      // Write data to the mock entry
      mockEntry.write(testData)
      mockEntry.end()

      // Close the parse stream
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result).toEqual(testData)
    })

    it('should extract a file matching glob pattern *.db', async () => {
      const mockStream = new PassThrough()
      const testData = Buffer.from('database content')

      const mockEntry = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry.path = 'data/myapp.db'
      mockEntry.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFileFromZip(mockStream, '*.db')

      parseStream.emit('entry', mockEntry)
      mockEntry.write(testData)
      mockEntry.end()
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result).toEqual(testData)
    })

    it('should extract a file matching pattern with single character wildcard', async () => {
      const mockStream = new PassThrough()
      const testData = Buffer.from('test content')

      const mockEntry = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry.path = 'file1.txt'
      mockEntry.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFileFromZip(mockStream, 'file?.txt')

      parseStream.emit('entry', mockEntry)
      mockEntry.write(testData)
      mockEntry.end()
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result).toEqual(testData)
    })

    it('should reject when no file matches the pattern', async () => {
      const mockStream = new PassThrough()

      const mockEntry = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry.path = 'other.txt'
      mockEntry.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFileFromZip(mockStream, '*.db')

      parseStream.emit('entry', mockEntry)
      mockEntry.end()
      parseStream.emit('finish')

      await expect(extractPromise).rejects.toThrow('File matching pattern "*.db" not found in zip')
      expect(mockEntry.autodrain).toHaveBeenCalled()
    })
  })

  describe('extractFilesFromZip', () => {
    it('should extract multiple files matching exact names', async () => {
      const mockStream = new PassThrough()
      const testData1 = Buffer.from('data 1')
      const testData2 = Buffer.from('data 2')

      const mockEntry1 = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry1.path = 'file1.txt'
      mockEntry1.autodrain = vi.fn()

      const mockEntry2 = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry2.path = 'file2.txt'
      mockEntry2.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFilesFromZip(mockStream, ['file1.txt', 'file2.txt'])

      parseStream.emit('entry', mockEntry1)
      mockEntry1.write(testData1)
      mockEntry1.end()

      parseStream.emit('entry', mockEntry2)
      mockEntry2.write(testData2)
      mockEntry2.end()

      // Allow entries to finish processing before emitting finish
      await new Promise((resolve) => setImmediate(resolve))
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result.size).toBe(2)
      expect(result.get('file1.txt')).toEqual(testData1)
      expect(result.get('file2.txt')).toEqual(testData2)
    })

    it('should extract multiple files matching glob patterns', async () => {
      const mockStream = new PassThrough()
      const dbData = Buffer.from('database')
      const jsonData = Buffer.from('{"key": "value"}')

      const mockEntry1 = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry1.path = 'data/app.db'
      mockEntry1.autodrain = vi.fn()

      const mockEntry2 = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry2.path = 'config/settings.json'
      mockEntry2.autodrain = vi.fn()

      const mockEntry3 = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry3.path = 'readme.txt'
      mockEntry3.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFilesFromZip(mockStream, ['*.db', '*.json'])

      parseStream.emit('entry', mockEntry1)
      mockEntry1.write(dbData)
      mockEntry1.end()

      parseStream.emit('entry', mockEntry2)
      mockEntry2.write(jsonData)
      mockEntry2.end()

      parseStream.emit('entry', mockEntry3)
      mockEntry3.end()

      // Allow entries to finish processing before emitting finish
      await new Promise((resolve) => setImmediate(resolve))
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result.size).toBe(2)
      expect(result.get('data/app.db')).toEqual(dbData)
      expect(result.get('config/settings.json')).toEqual(jsonData)
      expect(mockEntry3.autodrain).toHaveBeenCalled()
    })

    it('should return empty map when no files match patterns', async () => {
      const mockStream = new PassThrough()

      const mockEntry = new PassThrough() as PassThrough & { autodrain: () => void; path: string }
      mockEntry.path = 'other.txt'
      mockEntry.autodrain = vi.fn()

      const parseStream = new PassThrough()
      vi.spyOn(unzipper, 'Parse').mockReturnValue(parseStream as never)

      const extractPromise = extractFilesFromZip(mockStream, ['*.db', '*.json'])

      parseStream.emit('entry', mockEntry)
      mockEntry.end()
      parseStream.emit('finish')

      const result = await extractPromise
      expect(result.size).toBe(0)
      expect(mockEntry.autodrain).toHaveBeenCalled()
    })
  })
})
