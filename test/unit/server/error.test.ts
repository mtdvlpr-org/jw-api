import { describe, expect, it, vi } from 'vitest'

import {
  apiBadRequestError,
  apiForbiddenError,
  apiInternalError,
  apiNotFoundError,
  apiUnauthorizedError
} from '../../../server/utils/response'

// Mock globals BEFORE importing anything that uses them
vi.hoisted(() => {
  vi.stubGlobal('createError', (error: unknown) => error)
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
    })
  })

  describe('apiUnauthorizedError', () => {
    it('should create a 401 error', () => {
      const error = apiUnauthorizedError('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toBe('Unauthorized')
      expect(error.message).toBe('Unauthorized')
    })
  })

  describe('apiForbiddenError', () => {
    it('should create a 403 error', () => {
      const error = apiForbiddenError('Forbidden')
      expect(error.statusCode).toBe(403)
      expect(error.statusMessage).toBe('Forbidden')
      expect(error.message).toBe('Forbidden')
    })
  })
})
