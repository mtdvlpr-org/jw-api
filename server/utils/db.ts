export const getDbPath = (db: DbName) => `./.data/${db}.sqlite`

type Primitive = boolean | null | number | string | undefined

/**
 * Queries the database.
 * @param strings The strings to query.
 * @param values The values to query.
 * @returns The result of the query.
 */
const queryDb =
  (db: DbName) =>
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
        throw createInternalServerError('SQL query failed.', result.error)
      }

      return result.rows as T[]
    } catch (e) {
      throw createInternalServerError('SQL query failed.', e)
    }
  }

/**
 * Queries the database for a single row.
 * @param strings The strings to query.
 * @param values The values to query.
 * @returns The result of the query.
 */
const queryDbSingle =
  (db: DbName) =>
  async <T = unknown>(strings: TemplateStringsArray, ...values: Primitive[]): Promise<T> => {
    const [row] = await queryDb(db)<T>(strings, ...values)
    if (!row) throw createNotFoundError('SQL query returned no rows.')
    return row
  }

export const getDatabase = (db: DbName) => {
  return { query: queryDb(db), querySingle: queryDbSingle(db) }
}
