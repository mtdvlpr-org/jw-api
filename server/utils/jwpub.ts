import { downloadRepository } from '#server/repository/download'
import { Readable } from 'node:stream'

/**
 * Extracts the database from a remote JWPUB file.
 *
 * @param db The database to extract.
 * @param url The URL of the publication zip file.
 * @returns The path to the extracted database file.
 */
const getJwpubDatabase = async (url: string, db: DbName = 'jwpub'): Promise<string> => {
  const outputPath = getDbPath(db)

  // Fetch the outer zip as a stream
  const outerZipStream = await downloadRepository.stream(url)

  // Extract the database file from the nested contents zip
  await extractFromNestedZip(Readable.fromWeb(outerZipStream), 'contents', '*.db', outputPath)

  return outputPath
}

/**
 * Gets a publication for a given date.
 * @param pub The publication to get.
 * @param langwritten The language to get the publication for. Defaults to English.
 * @param date The date to get the publication for. Defaults to the current date.
 * @returns The publication.
 */
const getWtArticleForDate = async (url: string, date?: Date) => {
  await getJwpubDatabase(url, 'wt')
  const dateString = formatDate(date, 'YYYYMMDD')
  const { querySingle } = getDatabase('wt')
  const {
    BeginParagraphOrdinal,
    DocumentId,
    EndParagraphOrdinal,
    FirstDateOffset,
    LastDateOffset
  } = await querySingle<{
    BeginParagraphOrdinal: number
    DocumentId: number
    EndParagraphOrdinal: number
    FirstDateOffset: string
    LastDateOffset: string
  }>`
    SELECT DocumentId, BeginParagraphOrdinal, EndParagraphOrdinal, FirstDateOffset, LastDateOffset
    FROM DatedText dt
    WHERE dt.FirstDateOffset <= ${dateString} AND dt.LastDateOffset >= ${dateString}
  `

  const { Caption } = await querySingle<{ Caption: string }>`
  SELECT Caption
  FROM InternalLink il
  JOIN DocumentInternalLink dil ON dil.InternalLinkId = il.InternalLinkId
  WHERE dil.DocumentId = ${DocumentId} AND dil.BeginParagraphOrdinal >= ${BeginParagraphOrdinal} AND dil.EndParagraphOrdinal <= ${EndParagraphOrdinal}
  `

  const html = parseHtml(Caption)
  const title = html.querySelector('span.etitle')?.innerText ?? html.innerText

  return { end: LastDateOffset, start: FirstDateOffset, title }
}

/**
 * Gets a publication for a given date.
 * @param pub The publication to get.
 * @param langwritten The language to get the publication for. Defaults to English.
 * @param date The date to get the publication for. Defaults to the current date.
 * @returns The publication.
 */
const getMwbArticleForDate = async (url: string, date?: Date) => {
  await getJwpubDatabase(url, 'mwb')
  const dateString = formatDate(date, 'YYYYMMDD')
  const { querySingle } = getDatabase('mwb')
  const { Caption, FirstDateOffset, LastDateOffset } = await querySingle<{
    Caption: string
    FirstDateOffset: string
    LastDateOffset: string
  }>`
    SELECT Caption, FirstDateOffset, LastDateOffset
    FROM DatedText dt
    WHERE dt.FirstDateOffset <= ${dateString} AND dt.LastDateOffset >= ${dateString}
  `

  const html = parseHtml(Caption)
  const title = html.querySelector('span.etitle')?.innerText ?? html.innerText

  return { end: LastDateOffset, start: FirstDateOffset, title }
}

export const jwpubService = { getDatabase, getMwbArticleForDate, getWtArticleForDate }
