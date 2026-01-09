import { describe, expect, it, vi } from 'vitest'

import { asyncLocalStorage } from '../../../server/utils/async-storage'
import { defineLoggedEventHandler } from '../../../server/utils/handler'
import { logger } from '../../../server/utils/logger'

// Stub globals
vi.stubGlobal('asyncLocalStorage', asyncLocalStorage)
const defineEventHandler = vi.fn((handler) => handler)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-1234' })

// Stub console methods to verify fallback
const consoleSpy = {
  debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
}

describe('logging utils', () => {
  describe('logger', () => {
    it('should fall back to console when no store is available', () => {
      logger.info('test info')
      expect(consoleSpy.info).toHaveBeenCalledWith('test info')

      logger.error('test error')
      expect(consoleSpy.error).toHaveBeenCalledWith('test error')

      logger.debug('test debug')
      expect(consoleSpy.debug).toHaveBeenCalledWith('test debug')

      logger.warn('test warn')
      expect(consoleSpy.warn).toHaveBeenCalledWith('test warn')
    })

    it('should use store logger when available', () => {
      const mockLogger = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
      }

      const context = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger: mockLogger as any,
        requestId: 'test-request-id',
        startTime: Date.now()
      }

      asyncLocalStorage.run(context, () => {
        logger.info('store info')
        expect(mockLogger.info).toHaveBeenCalledWith('store info')
        expect(consoleSpy.info).not.toHaveBeenCalledWith('store info')

        logger.debug('store debug')
        expect(mockLogger.debug).toHaveBeenCalledWith('store debug')

        logger.warn('store warn')
        expect(mockLogger.warn).toHaveBeenCalledWith('store warn')

        logger.error('store error')
        expect(mockLogger.error).toHaveBeenCalledWith('store error')
      })
    })
  })

  describe('defineLoggedEventHandler', () => {
    it('should log request lifecycle', async () => {
      const mockLogger = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
      }
      const mockEvent = {
        node: {
          req: {
            headers: { 'x-tracing-id': 'trace-123' },
            log: mockLogger,
            url: '/test'
          }
        }
      }
      const handler = vi.fn().mockResolvedValue('response')

      const wrapped = defineLoggedEventHandler(handler)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await wrapped(mockEvent as any)

      expect(result).toBe('response')
      expect(mockLogger.info).toHaveBeenCalledWith('Request received: /test')
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Request completed in'))
      expect(handler).toHaveBeenCalledWith(mockEvent)
    })

    it('should log errors and rethrow', async () => {
      const mockLogger = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
      }
      const mockEvent = {
        node: {
          req: {
            headers: {},
            log: mockLogger,
            url: '/test-error'
          }
        }
      }
      const error = new Error('test error')
      const handler = vi.fn().mockRejectedValue(error)

      const wrapped = defineLoggedEventHandler(handler)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(wrapped(mockEvent as any)).rejects.toThrow('test error')

      expect(mockLogger.info).toHaveBeenCalledWith('Request received: /test-error')
      expect(mockLogger.error).toHaveBeenCalledWith(error)
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Request completed in'))
    })
  })
})
