import type { Database } from 'sql.js'

import { downloadRepository } from '#server/repository/download'

/**
 * Extracts the database from a remote JWPUB file.
 *
 * @param url The URL of the publication JWPUB file.
 * @returns The loaded database.
 */
const getDatabase = async (url: string): Promise<Database> => {
  const blob = await downloadRepository.blob(url)
  const outerZip = await extractZipFiles(blob)
  const innerZip = await extractZipFiles(await outerZip.files['contents'].async('uint8array'))

  const dbFile = Object.keys(innerZip.files).find((file) => file.endsWith('.db'))
  if (!dbFile) throw createNotFoundError('No database file found in the JWPUB file.')

  const sqlDb = await innerZip.files[dbFile].async('uint8array')

  return loadDatabase(sqlDb)
}

/**
 * Gets a Watchtower article for a given date.
 * @param url The URL of the publication JWPUB file.
 * @param date The date to get the article for. Defaults to the current date.
 * @returns The article.
 */
const getWtArticleForDate = async (url: string, date?: Date) => {
  const db = await getDatabase(url)
  const dateString = formatDate(date, 'YYYYMMDD')
  const {
    BeginParagraphOrdinal,
    DocumentId,
    EndParagraphOrdinal,
    FirstDateOffset,
    LastDateOffset
  } = queryDatabaseSingle<{
    BeginParagraphOrdinal: number
    DocumentId: number
    EndParagraphOrdinal: number
    FirstDateOffset: string
    LastDateOffset: string
  }>(
    db,
    `SELECT DocumentId, BeginParagraphOrdinal, EndParagraphOrdinal, FirstDateOffset, LastDateOffset
    FROM DatedText dt
    WHERE dt.FirstDateOffset <= ${dateString} AND dt.LastDateOffset >= ${dateString}`
  )

  const { Caption } = queryDatabaseSingle<{ Caption: string }>(
    db,
    `SELECT Caption
    FROM InternalLink il
      JOIN DocumentInternalLink dil ON dil.InternalLinkId = il.InternalLinkId
    WHERE dil.DocumentId = ${DocumentId} AND dil.BeginParagraphOrdinal >= ${BeginParagraphOrdinal} AND dil.EndParagraphOrdinal <= ${EndParagraphOrdinal}`
  )

  const html = parseHtml(Caption)
  const title = html.querySelector('span.etitle')?.innerText ?? html.innerText

  return { end: LastDateOffset, start: FirstDateOffset, title }
}

/**
 * Gets a Meeting Workbook article for a given date.
 * @param url The URL of the publication JWPUB file.
 * @param date The date to get the article for. Defaults to the current date.
 * @returns The article.
 */
const getMwbArticleForDate = async (url: string, date?: Date) => {
  const db = await getDatabase(url)
  const dateString = formatDate(date, 'YYYYMMDD')
  const { Caption, FirstDateOffset, LastDateOffset } = queryDatabaseSingle<{
    Caption: string
    FirstDateOffset: string
    LastDateOffset: string
  }>(
    db,
    `SELECT Caption, FirstDateOffset, LastDateOffset
    FROM DatedText dt
    WHERE dt.FirstDateOffset <= ${dateString} AND dt.LastDateOffset >= ${dateString}`
  )

  const html = parseHtml(Caption)
  const title = html.querySelector('span.etitle')?.innerText ?? html.innerText

  return { end: LastDateOffset, start: FirstDateOffset, title }
}

export const jwpubService = { getDatabase, getMwbArticleForDate, getWtArticleForDate }
