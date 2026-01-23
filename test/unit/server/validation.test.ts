import type { H3Event } from 'h3'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { parseBody, parseQuery, parseRouteParams } from '../../../server/utils/validation'

// Mock auto-imports BEFORE any imports
const { mockApiBadRequestError, mockGetQuery, mockGetRouterParams, mockReadBody } = vi.hoisted(
  () => {
    const mockApiBadRequestError = vi.fn((message: string, options?: { details?: unknown[] }) => {
      const error = new Error(message) as Error & { details?: unknown[]; status: number }
      error.status = 400
      error.details = options?.details
      return error
    })

    const mockGetQuery = vi.fn()
    const mockGetRouterParams = vi.fn()
    const mockReadBody = vi.fn()

    vi.stubGlobal('apiBadRequestError', mockApiBadRequestError)
    vi.stubGlobal('getQuery', mockGetQuery)
    vi.stubGlobal('getRouterParams', mockGetRouterParams)
    vi.stubGlobal('readBody', mockReadBody)

    return { mockApiBadRequestError, mockGetQuery, mockGetRouterParams, mockReadBody }
  }
)

describe('validation utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('parseQuery', () => {
    it('should parse and validate valid query parameters', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ limit: z.coerce.number().optional(), page: z.coerce.number() })
      const mockQuery = { limit: '20', page: '1' }

      mockGetQuery.mockReturnValue(mockQuery)

      const result = parseQuery(mockEvent, schema)

      expect(result).toEqual({ limit: 20, page: 1 })
      expect(mockGetQuery).toHaveBeenCalledWith(mockEvent)
    })

    it('should throw apiBadRequestError for invalid query parameters', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ page: z.coerce.number() })
      const mockQuery = { page: 'invalid' }

      mockGetQuery.mockReturnValue(mockQuery)

      expect(() => parseQuery(mockEvent, schema)).toThrow('Invalid query parameter(s)')
      expect(mockApiBadRequestError).toHaveBeenCalledWith('Invalid query parameter(s)', {
        details: expect.any(Array)
      })
    })

    it('should include validation details in error', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ email: z.string().email() })
      const mockQuery = { email: 'not-an-email' }

      mockGetQuery.mockReturnValue(mockQuery)

      try {
        parseQuery(mockEvent, schema)
      } catch (error) {
        // eslint-disable-next-line vitest/no-conditional-expect
        expect(error).toBeInstanceOf(Error)
        const errorWithDetails = error as Error & { details?: unknown[] }
        // eslint-disable-next-line vitest/no-conditional-expect
        expect(errorWithDetails.details).toBeDefined()
        // eslint-disable-next-line vitest/no-conditional-expect
        expect(Array.isArray(errorWithDetails.details)).toBe(true)
      }
    })
  })

  describe('parseRouteParams', () => {
    it('should parse and validate valid route parameters', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ id: z.coerce.number() })
      const mockParams = { id: '123' }

      mockGetRouterParams.mockReturnValue(mockParams)

      const result = parseRouteParams(mockEvent, schema)

      expect(result).toEqual({ id: 123 })
      expect(mockGetRouterParams).toHaveBeenCalledWith(mockEvent)
    })

    it('should throw apiBadRequestError for invalid route parameters', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ id: z.string().uuid() })
      const mockParams = { id: 'not-a-uuid' }

      mockGetRouterParams.mockReturnValue(mockParams)

      expect(() => parseRouteParams(mockEvent, schema)).toThrow('Invalid route parameter(s)')
      expect(mockApiBadRequestError).toHaveBeenCalledWith('Invalid route parameter(s)', {
        details: expect.any(Array)
      })
    })

    it('should handle missing required parameters', () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ id: z.string(), name: z.string() })
      const mockParams = { id: '123' }

      mockGetRouterParams.mockReturnValue(mockParams)

      expect(() => parseRouteParams(mockEvent, schema)).toThrow('Invalid route parameter(s)')
    })
  })

  describe('parseBody', () => {
    it('should parse and validate valid request body', async () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ email: z.string().email(), name: z.string() })
      const mockBody = { email: 'test@example.com', name: 'Test User' }

      mockReadBody.mockResolvedValue(mockBody)

      const result = await parseBody(mockEvent, schema)

      expect(result).toEqual(mockBody)
      expect(mockReadBody).toHaveBeenCalledWith(mockEvent)
    })

    it('should throw apiBadRequestError for invalid request body', async () => {
      const mockEvent = {} as H3Event
      const schema = z.object({ age: z.number().positive(), name: z.string() })
      const mockBody = { age: -5, name: 'Test' }

      mockReadBody.mockResolvedValue(mockBody)

      await expect(parseBody(mockEvent, schema)).rejects.toThrow('Invalid request body')
      expect(mockApiBadRequestError).toHaveBeenCalledWith('Invalid request body', {
        details: expect.any(Array)
      })
    })

    it('should handle nested object validation', async () => {
      const mockEvent = {} as H3Event
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
          name: z.string()
        })
      })
      const mockBody = { user: { email: 'test@example.com', name: 'Test' } }

      mockReadBody.mockResolvedValue(mockBody)

      const result = await parseBody(mockEvent, schema)

      expect(result).toEqual(mockBody)
    })

    it('should handle optional fields correctly', async () => {
      const mockEvent = {} as H3Event
      const schema = z.object({
        name: z.string(),
        optional: z.string().optional()
      })
      const mockBody = { name: 'Test' }

      mockReadBody.mockResolvedValue(mockBody)

      const result = await parseBody(mockEvent, schema)

      expect(result).toEqual({ name: 'Test' })
    })
  })
})
