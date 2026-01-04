import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadDatabase, queryDatabase, queryDatabaseSingle } from '../../../server/utils/sqlite'

// Mocks
const mockExec = vi.fn()
const MockDatabase = vi.fn(() => ({
  exec: mockExec
}))

vi.mock('sql.js', () => {
  return {
    default: vi.fn(() => ({
      Database: MockDatabase
    }))
  }
})

// Globals
const createInternalServerError = vi.fn((msg, cause) => {
  const err = new Error(msg)
  err.cause = cause
  return err
})
const createNotFoundError = vi.fn((msg) => new Error(msg))

vi.stubGlobal('createInternalServerError', createInternalServerError)
vi.stubGlobal('createNotFoundError', createNotFoundError)

describe('sqlite utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('loadDatabase', () => {
    it('should initialize SQL.js and load database', async () => {
      const data = Buffer.from('test data')
      const db = await loadDatabase(data)

      expect(MockDatabase).toHaveBeenCalledWith(data)
      expect(db).toBeDefined()
    })
  })

  describe('queryDatabase', () => {
    it('should execute query and map results', async () => {
      const db = await loadDatabase(Buffer.from(''))
      // Mock db.exec to return standard sql.js format
      mockExec.mockReturnValue([
        {
          columns: ['id', 'name'],
          values: [
            [1, 'test1'],
            [2, 'test2']
          ]
        }
      ])

      const result = queryDatabase(db, 'SELECT * FROM test')

      expect(result).toEqual([
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' }
      ])
    })

    it('should handle errors', async () => {
      const db = await loadDatabase(Buffer.from(''))
      mockExec.mockImplementation(() => {
        throw new Error('DB Error')
      })

      expect(() => queryDatabase(db, 'SELECT *')).toThrow('SQL query failed.')
      expect(createInternalServerError).toHaveBeenCalledWith('SQL query failed.', {
        message: 'DB Error',
        query: 'SELECT *'
      })
    })

    it('should handle non-error objects thrown', async () => {
      const db = await loadDatabase(Buffer.from(''))
      mockExec.mockImplementation(() => {
        throw 'String Error'
      })

      expect(() => queryDatabase(db, 'SELECT *')).toThrow('SQL query failed.')
      expect(createInternalServerError).toHaveBeenCalledWith('SQL query failed.', {
        message: 'String Error',
        query: 'SELECT *'
      })
    })
  })

  describe('queryDatabaseSingle', () => {
    it('should return single result', async () => {
      const db = await loadDatabase(Buffer.from(''))
      mockExec.mockReturnValue([
        {
          columns: ['id'],
          values: [[1]]
        }
      ])

      const result = queryDatabaseSingle(db, 'SELECT *')
      expect(result).toEqual({ id: 1 })
    })

    it('should throw if no results', async () => {
      const db = await loadDatabase(Buffer.from(''))
      mockExec.mockReturnValue([
        {
          columns: ['id'],
          values: []
        }
      ])

      expect(() => queryDatabaseSingle(db, 'SELECT *')).toThrow('No result found for query.')
      expect(createNotFoundError).toHaveBeenCalled()
    })
  })
})
