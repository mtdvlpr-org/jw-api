import JSZip from 'jszip'
import fs from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { decompressGzip, extractZipFiles } from '../../../server/utils/zip'

vi.mock('node:fs')
vi.mock('node:zlib')
vi.mock('node:stream/promises')
vi.mock('jszip')

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

vi.stubGlobal('createInternalServerError', createInternalServerError)
vi.stubGlobal('logger', logger)

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

  describe('extractZipFiles', () => {
    it('should load zip data using JSZip', async () => {
      const mockData = Buffer.from('test')
      const mockLoadAsync = vi.fn().mockResolvedValue('extracted data')
      // Mock JSZip constructor to return an object with loadAsync
      vi.mocked(JSZip).mockImplementation(
        () =>
          ({
            loadAsync: mockLoadAsync
          }) as unknown as JSZip
      )

      const result = await extractZipFiles(mockData)

      expect(JSZip).toHaveBeenCalled()
      expect(mockLoadAsync).toHaveBeenCalledWith(mockData)
      expect(result).toBe('extracted data')
    })
  })
})
