import { describe, expect, it, vi } from 'vitest'

import {
  createBadRequestError,
  createForbiddenError,
  createInternalServerError,
  createNotFoundError,
  createUnauthorizedError
} from '../../../server/utils/error'

// Mock globals BEFORE importing anything that uses them
vi.hoisted(() => {
  const logger = { error: vi.fn() }

  vi.stubGlobal('createError', (error: unknown) => error)
  vi.stubGlobal('logger', logger)
})

describe('error utils', () => {
  describe('createNotFoundError', () => {
    it('should create a 404 error with correct status', () => {
      const error = createNotFoundError('Not Found')
      expect(error.statusCode).toBe(404)
      expect(error.statusMessage).toBe('Not Found')
      expect(error.statusText).toBe('Not Found')
    })

    it('should include data if provided', () => {
      const data = { id: 1 }
      const error = createNotFoundError('Not Found', data)
      expect(error.data).toEqual(data)
    })
  })

  describe('createBadRequestError', () => {
    it('should create a 400 error', () => {
      const error = createBadRequestError('Bad Request')
      expect(error.statusCode).toBe(400)
      expect(error.statusMessage).toBe('Bad Request')
      expect(error.statusText).toBe('Bad Request')
    })
  })

  describe('createInternalServerError', () => {
    it('should create a 500 error', () => {
      const error = createInternalServerError('Server Error')
      expect(error.statusCode).toBe(500)
      expect(error.statusMessage).toBe('Server Error')
      expect(error.statusText).toBe('Internal Server Error')
    })
  })

  describe('createUnauthorizedError', () => {
    it('should create a 401 error', () => {
      const error = createUnauthorizedError('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toBe('Unauthorized')
      expect(error.statusText).toBe('Unauthorized')
    })
  })

  describe('createForbiddenError', () => {
    it('should create a 403 error', () => {
      const error = createForbiddenError('Forbidden')
      expect(error.statusCode).toBe(403)
      expect(error.statusMessage).toBe('Forbidden')
      expect(error.statusText).toBe('Forbidden')
    })
  })
})
