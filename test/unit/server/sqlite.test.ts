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
const apiInternalError = vi.fn((msg, opts) => {
  const err = new Error(msg)
  if (opts?.cause) err.cause = opts.cause
  return err
})
const apiNotFoundError = vi.fn((msg) => new Error(msg))
const logger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
}

vi.stubGlobal('apiInternalError', apiInternalError)
vi.stubGlobal('apiNotFoundError', apiNotFoundError)
vi.stubGlobal('logger', logger)

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
      const error = new Error('DB Error')
      mockExec.mockImplementation(() => {
        throw error
      })

      expect(() => queryDatabase(db, 'SELECT *')).toThrow('SQL query failed: DB Error')
      expect(apiInternalError).toHaveBeenCalledWith('SQL query failed: DB Error', { cause: error })
    })

    it('should handle non-error objects thrown', async () => {
      const db = await loadDatabase(Buffer.from(''))
      mockExec.mockImplementation(() => {
        throw 'String Error'
      })

      expect(() => queryDatabase(db, 'SELECT *')).toThrow('SQL query failed: String Error')
      expect(apiInternalError).toHaveBeenCalledWith('SQL query failed: String Error', {
        cause: 'String Error'
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

      expect(() => queryDatabaseSingle(db, 'SELECT *')).toThrow('No result found for query')
      expect(apiNotFoundError).toHaveBeenCalledWith('No result found for query')
    })
  })
})
