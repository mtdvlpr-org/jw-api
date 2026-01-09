import { beforeEach, describe, expect, it, vi } from 'vitest'

import { asyncLocalStorage } from '../../../server/utils/async-storage'
// Import after mocking
import { defineLoggedEventHandler } from '../../../server/utils/handler'

// Mock node:crypto module
vi.mock('node:crypto', () => ({
  randomUUID: () => 'test-uuid-1234'
}))

// Stub defineEventHandler
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
// Stub asyncLocalStorage global since it's auto-imported in handler.ts
vi.stubGlobal('asyncLocalStorage', asyncLocalStorage)

describe('handler utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('defineLoggedEventHandler', () => {
    it('should run handler within asyncLocalStorage context', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const mockLogger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() }
      const mockEvent = {
        node: {
          req: {
            headers: { 'x-tracing-id': 'trace-123' },
            log: mockLogger,
            url: '/test'
          }
        }
      }

      // Mock asyncLocalStorage.run to execute the callback immediately
      const runSpy = vi.spyOn(asyncLocalStorage, 'run').mockImplementation((store, callback) => {
        return callback()
      })

      const wrappedHandler = defineLoggedEventHandler(mockHandler)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await wrappedHandler(mockEvent as any)

      expect(result).toBe('success')
      expect(mockLogger.info).toHaveBeenCalledWith('Request received: /test')
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Request completed in'))
      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logger: mockLogger,
          requestId: 'trace-123',
          startTime: expect.any(Number)
        }),
        expect.any(Function)
      )
    })

    it('should use crypto.randomUUID when x-tracing-id header is missing', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const mockLogger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() }
      const mockEvent = {
        node: {
          req: {
            headers: {},
            log: mockLogger,
            url: '/test'
          }
        }
      }

      const runSpy = vi.spyOn(asyncLocalStorage, 'run').mockImplementation((store, callback) => {
        return callback()
      })

      const wrappedHandler = defineLoggedEventHandler(mockHandler)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await wrappedHandler(mockEvent as any)

      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'test-uuid-1234'
        }),
        expect.any(Function)
      )
    })

    it('should log error and rethrow if handler fails', async () => {
      const mockError = new Error('Test error')
      const mockHandler = vi.fn().mockRejectedValue(mockError)
      const mockLogger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() }
      const mockEvent = {
        node: {
          req: {
            headers: {},
            log: mockLogger,
            url: '/error'
          }
        }
      }

      vi.spyOn(asyncLocalStorage, 'run').mockImplementation((store, callback) => {
        return callback()
      })

      const wrappedHandler = defineLoggedEventHandler(mockHandler)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(wrappedHandler(mockEvent as any)).rejects.toThrow('Test error')
      expect(mockLogger.error).toHaveBeenCalledWith(mockError)
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Request completed in'))
    })

    it('should handle non-Error objects in catch', async () => {
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
            url: '/test-error-string'
          }
        }
      }
      const error = 'string error'
      const handler = vi.fn().mockRejectedValue(error)

      const wrapped = defineLoggedEventHandler(handler)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(wrapped(mockEvent as any)).rejects.toBe('string error')

      expect(mockLogger.info).toHaveBeenCalledWith('Request received: /test-error-string')
      expect(mockLogger.error).toHaveBeenCalledWith(error)
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Request completed in'))
    })
  })
})
