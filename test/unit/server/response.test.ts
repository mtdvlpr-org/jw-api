import { createError } from 'nuxt/app'
import { FetchError } from 'ofetch'
import { describe, expect, it, vi } from 'vitest'

import {
  apiBadRequestError,
  apiForbiddenError,
  apiInternalError,
  apiNotFoundError,
  apiPaginated,
  apiSuccess,
  apiUnauthorizedError,
  isApiError,
  toFetchApiError
} from '../../../server/utils/response'

// Mock globals BEFORE importing anything that uses them
vi.hoisted(() => {
  vi.stubGlobal('createError', createError)
  vi.stubGlobal('useRuntimeConfig', () => ({ apiVersion: 'v1' }))
  vi.stubGlobal('asyncLocalStorage', {
    getStore: () => ({ requestId: 'test-123', startTime: Date.now() })
  })
})

describe('api error utils', () => {
  describe('apiNotFoundError', () => {
    it('should create a 404 error with correct status', () => {
      const error = apiNotFoundError('Not Found')
      expect(error.statusCode).toBe(404)
      expect(error.statusMessage).toBe('Not Found')
      expect(error.message).toBe('Not Found')
      expect(isApiError(error)).toBe(true)
    })

    it('should include data with meta', () => {
      const error = apiNotFoundError('Not Found')
      expect(error.data).toHaveProperty('meta')
      expect(error.data.meta).toHaveProperty('requestId')
      expect(error.data.meta).toHaveProperty('version', 'v1')
    })

    it('should include cause if provided', () => {
      const cause = new Error('Original error')
      const error = apiNotFoundError('Not Found', { cause })
      expect(error.cause).toBe(cause)
    })
  })

  describe('apiBadRequestError', () => {
    it('should create a 400 error', () => {
      const error = apiBadRequestError('Bad Request')
      expect(error.statusCode).toBe(400)
      expect(error.statusMessage).toBe('Bad Request')
      expect(error.message).toBe('Bad Request')
      expect(isApiError(error)).toBe(true)
    })

    it('should include details if provided', () => {
      const details = [{ code: 'invalid_type', message: 'Invalid', path: ['field'] }]
      const error = apiBadRequestError('Bad Request', { details })
      expect(error.data).toHaveProperty('details', details)
    })
  })

  describe('apiInternalError', () => {
    it('should create a 500 error', () => {
      const error = apiInternalError('Server Error')
      expect(error.statusCode).toBe(500)
      expect(error.statusMessage).toBe('Internal Server Error')
      expect(error.message).toBe('Server Error')
      expect(isApiError(error)).toBe(true)
    })
  })

  describe('apiUnauthorizedError', () => {
    it('should create a 401 error', () => {
      const error = apiUnauthorizedError('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toBe('Unauthorized')
      expect(error.message).toBe('Unauthorized')
      expect(isApiError(error)).toBe(true)
    })
  })

  describe('apiForbiddenError', () => {
    it('should create a 403 error', () => {
      const error = apiForbiddenError('Forbidden')
      expect(error.statusCode).toBe(403)
      expect(error.statusMessage).toBe('Forbidden')
      expect(error.message).toBe('Forbidden')
      expect(isApiError(error)).toBe(true)
    })
  })

  describe('apiSuccess', () => {
    it('should create successful response with data', () => {
      const data = { message: 'Success' }
      const response = apiSuccess(data)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.meta).toHaveProperty('requestId')
      expect(response.meta).toHaveProperty('version', 'v1')
      expect(response.meta).toHaveProperty('responseTime')
      expect(response.meta).toHaveProperty('timestamp')
    })

    it('should include links if provided', () => {
      const data = { test: 'data' }
      const links = { self: '/api/test' }
      const response = apiSuccess(data, links)

      expect(response.links).toEqual(links)
    })

    it('should not include links if not provided', () => {
      const response = apiSuccess({ test: 'data' })

      expect(response.links).toBeUndefined()
    })
  })

  describe('apiPaginated', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const pagination = {
        page: 1,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10
      }

      const response = apiPaginated(data, pagination)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.meta.pagination).toEqual(pagination)
    })

    it('should include links if provided', () => {
      const links = {
        first: '/api?page=1',
        last: '/api?page=10',
        next: '/api?page=2',
        self: '/api?page=1'
      }

      const response = apiPaginated(
        [],
        { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
        links
      )

      expect(response.links).toEqual(links)
    })

    it('should handle empty data array', () => {
      const response = apiPaginated([], { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 })

      expect(response.data).toEqual([])
      expect(response.meta.pagination.totalItems).toBe(0)
    })
  })

  describe('toFetchApiError', () => {
    const context = {
      notFoundMessage: 'Resource not found',
      serviceName: 'TestService'
    }

    it('should handle 400 errors', () => {
      const fetchError = new FetchError('Bad Request')
      fetchError.statusCode = 400

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toContain('Invalid request to TestService')
      expect('statusCode' in result && result.statusCode).toBe(400)
      expect(isApiError(result)).toBe(true)
    })

    it('should handle 401 errors', () => {
      const fetchError = new FetchError('Unauthorized')
      fetchError.statusCode = 401

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toContain('Unauthorized request to TestService')
      expect(isApiError(result)).toBe(true)
    })

    it('should handle 403 errors', () => {
      const fetchError = new FetchError('Forbidden')
      fetchError.statusCode = 403

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toBe(context.notFoundMessage)
      expect(isApiError(result)).toBe(true)
    })

    it('should handle 404 errors', () => {
      const fetchError = new FetchError('Not Found')
      fetchError.statusCode = 404

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toBe(context.notFoundMessage)
      expect(isApiError(result)).toBe(true)
    })

    it('should handle 500 errors', () => {
      const fetchError = new FetchError('Server Error')
      fetchError.statusCode = 500

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toContain('TestService service unavailable')
      expect(isApiError(result)).toBe(true)
    })

    it('should handle unknown status codes', () => {
      const fetchError = new FetchError('Unknown Error')
      fetchError.statusCode = 502

      const result = toFetchApiError(fetchError, context)

      expect(result.message).toContain('Failed to connect to TestService')
    })

    it('should return non-FetchError errors as-is', () => {
      const genericError = new Error('Generic error')

      const result = toFetchApiError(genericError, context)

      expect(result).toBe(genericError)
    })

    it('should convert non-Error values to Error', () => {
      const result = toFetchApiError('string error', context)

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('string error')
    })
  })

  describe('isApiError', () => {
    it('should return true for valid ApiError objects', () => {
      const validApiError = new Error('Test error')
      Object.assign(validApiError, {
        data: {
          meta: {
            requestId: 'test-123',
            responseTime: 100,
            timestamp: '2026-01-17T12:00:00.000Z',
            version: 'v1'
          }
        },
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(validApiError)).toBe(true)
    })

    it('should return false for regular Error objects', () => {
      const regularError = new Error('Regular error')

      expect(isApiError(regularError)).toBe(false)
    })

    it('should return false for Error missing statusCode', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: { meta: {} },
        fatal: false,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error missing fatal', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: { meta: {} },
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error missing statusMessage', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: { meta: {} },
        fatal: false,
        statusCode: 404
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error missing data', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error with non-object data', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: 'string',
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error with null data', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: null,
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for Error with data missing meta', () => {
      const error = new Error('Test error')
      Object.assign(error, {
        data: {},
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      expect(isApiError(error)).toBe(false)
    })

    it('should return false for non-Error objects', () => {
      const notAnError = {
        data: { meta: {} },
        fatal: false,
        statusCode: 404,
        statusMessage: 'Not Found'
      }

      expect(isApiError(notAnError)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isApiError(undefined)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isApiError('string')).toBe(false)
      expect(isApiError(123)).toBe(false)
      expect(isApiError(true)).toBe(false)
    })

    it('should return true when data has additional properties beyond meta', () => {
      const validApiError = new Error('Test error')
      Object.assign(validApiError, {
        data: {
          details: [{ message: 'Field error' }],
          meta: {
            requestId: 'test-123',
            responseTime: 100,
            timestamp: '2026-01-17T12:00:00.000Z',
            version: 'v1'
          }
        },
        fatal: false,
        statusCode: 400,
        statusMessage: 'Bad Request'
      })

      expect(isApiError(validApiError)).toBe(true)
    })
  })
})
