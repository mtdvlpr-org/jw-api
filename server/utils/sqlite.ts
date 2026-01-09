import initSqlJs, { type Database } from 'sql.js'

/**
 * Loads the database from the data.
 * @param data The data to load the database from.
 * @returns The loaded database.
 */
export const loadDatabase = async (data: ArrayLike<number> | Buffer): Promise<Database> => {
  logger.debug(`Loading database from data...`)
  const SQL = await initSqlJs()
  const db = new SQL.Database(data)
  return db
}

/**
 * Queries the database for multiple rows.
 * @param db The database to query.
 * @param query The query to execute.
 * @returns The multiple rows of the query.
 */
export const queryDatabase = <T extends Record<string, unknown>>(
  db: Database,
  query: string
): T[] => {
  try {
    logger.debug(query)
    const result = db.exec(query)
    const rows = result.flatMap((execResult) => {
      return execResult.values.map((rowValues) => {
        const object: T = {} as T
        execResult.columns.forEach((col, i) => {
          object[col as keyof T] = rowValues[i] as T[keyof T]
        })
        return object
      })
    })

    logger.debug(JSON.stringify(rows))
    return rows
  } catch (e) {
    throw apiInternalError(`SQL query failed: ${e instanceof Error ? e.message : String(e)}`, {
      cause: e
    })
  }
}

/**
 * Queries the database for a single row.
 * @param db The database to query.
 * @param query The query to execute.
 * @returns The single row of the query.
 */
export const queryDatabaseSingle = <T extends Record<string, unknown>>(
  db: Database,
  query: string
): T => {
  const result = queryDatabase<T>(db, query)
  if (result.length === 0) throw apiNotFoundError('No result found for query')
  return result[0]!
}
