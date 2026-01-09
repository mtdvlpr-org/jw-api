export const getDbPath = (db: DbKey) => `./.data/${db}.sqlite`

type Primitive = boolean | null | number | string | undefined

/**
 * Queries the database.
 * @param strings The strings to query.
 * @param values The values to query.
 * @returns The result of the query.
 */
const queryDb =
  (db: DbKey) =>
  async <T = unknown>(strings: TemplateStringsArray, ...values: Primitive[]): Promise<T[]> => {
    logger.debug(
      strings.reduce((query, str, i) => {
        return query + str.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ') + (values[i] ?? '')
      }, '')
    )

    try {
      const result = await useDatabase(db).sql(strings, ...values)
      logger.debug(JSON.stringify(result))

      if (result.error || !result.success || !result.rows) {
        throw apiInternalError(`SQL query failed: ${result.error}`)
      }

      return result.rows as T[]
    } catch (e) {
      if (e instanceof Error && 'statusCode' in e) {
        throw e
      }
      throw apiInternalError(`SQL query failed: ${e instanceof Error ? e.message : String(e)}`, {
        cause: e
      })
    }
  }

/**
 * Queries the database for a single row.
 * @param strings The strings to query.
 * @param values The values to query.
 * @returns The single row of the query.
 */
const queryDbSingle =
  (db: DbKey) =>
  async <T = unknown>(strings: TemplateStringsArray, ...values: Primitive[]): Promise<T> => {
    const [row] = await queryDb(db)<T>(strings, ...values)
    if (!row) throw apiNotFoundError('SQL query returned no rows')
    return row
  }

export const useDb = (db: DbKey) => {
  return { query: queryDb(db), querySingle: queryDbSingle(db) }
}
