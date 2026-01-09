import { downloadRepository } from '#server/repository/download'
import { pubMediaRepository } from '#server/repository/pubMedia'

/**
 * Gets a publication.
 * @param publication The publication to get.
 * @returns The publication.
 */
const getPublication = async (publication: PubFetcher) => {
  return await pubMediaRepository.fetchPublication(publication)
}

/**
 * Gets a meeting workbook.
 * @param langwritten The language to get the meeting workbook for. Defaults to English.
 * @param date The date to get the meeting workbook for. Defaults to the current month and year.
 * @param fileformat The file format to get the meeting workbook for. Defaults to all.
 * @returns The meeting workbook.
 */
const getMeetingWorkbook = async ({
  date,
  fileformat,
  langwritten = 'E'
}: {
  date?: { month: number; year: number }
  fileformat?: PublicationFileFormat
  langwritten: JwLangCode
}) => {
  const issue = getWorkbookIssue(date)
  return await pubMediaRepository.fetchPublication({ fileformat, issue, langwritten, pub: 'mwb' })
}

/**
 * Gets a meeting workbook JWPUB.
 * @param langwritten The language to get the meeting workbook for. Defaults to English.
 * @param date The date to get the meeting workbook for. Defaults to the current month and year.
 * @returns The meeting workbook JWPUB.
 */
const getMwbJwpub = async ({
  date,
  langwritten = 'E'
}: {
  date?: { month: number; year: number }
  langwritten: JwLangCode
}) => {
  const publication = await getMeetingWorkbook({ date, fileformat: 'JWPUB', langwritten })
  const jwpub = publication.files[langwritten]?.JWPUB?.[0]?.file.url
  if (!jwpub) throw apiNotFoundError('Meeting Workbook JWPUB not found')
  return jwpub
}

/**
 * Gets a study watchtower.
 * @param langwritten The language to get the study watchtower for. Defaults to English.
 * @param date The date to get the study watchtower for. Defaults to the current month and year.
 * @param fileformat The file format to get the study watchtower for. Defaults to all.
 * @returns The study watchtower.
 */
const getStudyWatchtower = async ({
  date,
  fileformat,
  langwritten = 'E'
}: {
  date?: { month: number; year: number }
  fileformat?: PublicationFileFormat
  langwritten: JwLangCode
}) => {
  const issue = getStudyWatchtowerIssue(date)
  return await pubMediaRepository.fetchPublication({ fileformat, issue, langwritten, pub: 'w' })
}

/**
 * Gets a study watchtower JWPUB.
 * @param langwritten The language to get the study watchtower for. Defaults to English.
 * @param date The date to get the study watchtower for. Defaults to the current month and year.
 * @returns The study watchtower JWPUB.
 */
const getWtJwpub = async ({
  date,
  langwritten = 'E'
}: {
  date?: { month: number; year: number }
  langwritten: JwLangCode
}) => {
  const publication = await getStudyWatchtower({ date, fileformat: 'JWPUB', langwritten })
  const jwpub = publication.files[langwritten]?.JWPUB?.[0]?.file.url
  if (!jwpub) throw apiNotFoundError('Study Watchtower JWPUB not found')
  return jwpub
}

const getWatchtowerArticles = async ({
  date,
  langwritten = 'E'
}: {
  date?: { month: number; year: number }
  langwritten: JwLangCode
}) => {
  const publication = await getStudyWatchtower({ date, fileformat: 'RTF', langwritten })
  const articles = publication.files[langwritten]!.RTF!.filter(
    (a) => a.mimetype === 'application/rtf'
  ).map(({ file, title }) => ({ file, title }))

  return { articles, issue: publication.issue }
}

const getWatchtowerArticleContent = async (url: string) => {
  const article = await downloadRepository.text(url)
  return parseRTF(article)
}

/**
 * A service wrapping the publication media repository.
 */
export const pubMediaService = {
  getMeetingWorkbook,
  getMwbJwpub,
  getPublication,
  getStudyWatchtower,
  getWatchtowerArticleContent,
  getWatchtowerArticles,
  getWtJwpub
}
