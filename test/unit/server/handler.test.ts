import { describe, expect, it, vi } from 'vitest'

import { asyncLocalStorage } from '../../../server/utils/async-storage'
import { defineLoggedEventHandler } from '../../../server/utils/handler'

// Stub defineEventHandler
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
// Stub asyncLocalStorage global since it's auto-imported in handler.ts
vi.stubGlobal('asyncLocalStorage', asyncLocalStorage)

describe('handler utils', () => {
  describe('defineLoggedEventHandler', () => {
    it('should run handler within asyncLocalStorage context', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const mockLogger = { error: vi.fn(), info: vi.fn() }
      const mockEvent = {
        node: {
          req: {
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
      expect(runSpy).toHaveBeenCalledWith({ logger: mockLogger }, expect.any(Function))
    })

    it('should log error and rethrow if handler fails', async () => {
      const mockError = new Error('Test error')
      const mockHandler = vi.fn().mockRejectedValue(mockError)
      const mockLogger = { error: vi.fn(), info: vi.fn() }
      const mockEvent = {
        node: {
          req: {
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
  })
})
