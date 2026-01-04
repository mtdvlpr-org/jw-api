import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDb } from '../../../server/utils/db'

// Globals
const logger = { debug: vi.fn() }
const createInternalServerError = vi.fn((msg, cause) => {
  const err = new Error(msg)
  err.cause = cause
  return err
})
const createNotFoundError = vi.fn((msg) => new Error(msg))
const sqlMock = vi.fn()
const useDatabase = vi.fn(() => ({ sql: sqlMock }))

vi.stubGlobal('logger', logger)
vi.stubGlobal('createInternalServerError', createInternalServerError)
vi.stubGlobal('createNotFoundError', createNotFoundError)
vi.stubGlobal('useDatabase', useDatabase)

describe('db utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('useDb', () => {
    it('should return query and querySingle functions', () => {
      const db = useDb('catalog')
      expect(db).toHaveProperty('query')
      expect(db).toHaveProperty('querySingle')
    })
  })

  describe('queryDb', () => {
    it('should execute SQL query and return rows', async () => {
      const { query } = useDb('catalog')
      const mockRows = [{ id: 1, name: 'test' }]
      sqlMock.mockResolvedValue({
        rows: mockRows,
        success: true
      })

      const result = await query`SELECT * FROM table WHERE id = ${1}`

      expect(useDatabase).toHaveBeenCalledWith('catalog')
      expect(sqlMock).toHaveBeenCalled()
      expect(result).toEqual(mockRows)
      expect(logger.debug).toHaveBeenCalled()
    })

    it('should throw error if query fails', async () => {
      const { query } = useDb('catalog')
      sqlMock.mockResolvedValue({
        error: 'Some error',
        success: false
      })

      await expect(query`SELECT * FROM table`).rejects.toThrow('SQL query failed.')
      expect(createInternalServerError).toHaveBeenCalledWith('SQL query failed.', 'Some error')
    })

    it('should catch and rethrow unexpected errors', async () => {
      const { query } = useDb('catalog')
      const error = new Error('Unexpected')
      sqlMock.mockRejectedValue(error)

      await expect(query`SELECT * FROM table`).rejects.toThrow('SQL query failed.')
      expect(createInternalServerError).toHaveBeenCalledWith('SQL query failed.', error)
    })
  })

  describe('queryDbSingle', () => {
    it('should execute SQL query and return single row', async () => {
      const { querySingle } = useDb('catalog')
      const mockRow = { id: 1, name: 'test' }
      sqlMock.mockResolvedValue({
        rows: [mockRow],
        success: true
      })

      const result = await querySingle`SELECT * FROM table WHERE id = ${1}`

      expect(useDatabase).toHaveBeenCalledWith('catalog')
      expect(sqlMock).toHaveBeenCalled()
      expect(result).toEqual(mockRow)
    })

    it('should throw error if no rows returned', async () => {
      const { querySingle } = useDb('catalog')
      sqlMock.mockResolvedValue({
        rows: [],
        success: true
      })

      await expect(querySingle`SELECT * FROM table`).rejects.toThrow('SQL query returned no rows.')
      expect(createNotFoundError).toHaveBeenCalledWith('SQL query returned no rows.')
    })
  })
})
