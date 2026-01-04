import { catalogRepository } from '#server/repository/catalog'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { Readable } from 'node:stream'

const CATALOG_FOLDER = './.data'
const CATALOG_PATH = CATALOG_FOLDER + '/catalog.sqlite'
const CATALOG_VERSION_KEY = 'catalog_version'

/**
 * Gets the catalog.
 * @param refresh Whether to force a refresh of the catalog. Defaults to false.
 * @returns The catalog.
 */
const getCatalog = async (refresh = false) => {
  const manifest = await catalogRepository.fetchManifest()

  if (!existsSync(CATALOG_FOLDER)) await mkdir(CATALOG_FOLDER)
  const storage = useStorage('db')

  if (
    refresh ||
    !existsSync(CATALOG_PATH) ||
    (await storage.getItem(CATALOG_VERSION_KEY)) !== manifest.current
  ) {
    logger.debug('Fetching catalog...')
    const stream = await catalogRepository.fetchCatalog(manifest.current)
    await decompressGzip(Readable.fromWeb(stream), CATALOG_PATH)
    await storage.setItem(CATALOG_VERSION_KEY, manifest.current)
  } else {
    logger.debug('Catalog up to date.')
  }
}

/**
 * Gets a publication for a given date.
 * @param pub The publication to get.
 * @param langwritten The language to get the publication for. Defaults to English.
 * @param date The date to get the publication for. Defaults to the current date.
 * @returns The publication.
 */
const getPublicationForDate = async (pub: string, langwritten: JwLangCode = 'E', date?: Date) => {
  const langId = langCodeToMepsId(langwritten)
  const dateString = formatDate(date)
  const { querySingle } = useDb('catalog')

  const { End, IssueTagNumber, Start } = await querySingle<{
    End: `${number}-${number}-${number}`
    IssueTagNumber: number
    Start: `${number}-${number}-${number}`
  }>`
      SELECT p.IssueTagNumber, dt.Start, dt.End
      FROM Publication p
        JOIN DatedText dt ON p.Id = dt.PublicationId
      WHERE p.KeySymbol = ${pub} 
        AND p.MepsLanguageId = ${langId} 
        AND ${dateString} >= dt.Start 
        AND ${dateString} <= dt.End`

  const issue = IssueTagNumber.toString() as `${number}`

  return {
    end: End,
    issue: issue.endsWith('00') ? (issue.slice(0, -2) as `${number}`) : issue,
    langwritten,
    pub,
    start: Start
  }
}

/**
 * A service wrapping the catalog repository.
 */
export const catalogService = { getCatalog, getPublicationForDate }
