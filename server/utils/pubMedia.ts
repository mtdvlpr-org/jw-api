import { pubMediaRepository } from '#server/repository/pubMedia'

/**
 * Gets a meeting workbook.
 * @param langwritten The language to get the meeting workbook for. Defaults to English.
 * @param date The date to get the meeting workbook for. Defaults to the current month and year.
 * @returns The meeting workbook.
 */
const getMeetingWorkbook = async (
  langwritten: JwLangCode = 'E',
  date?: { month: number; year: number }
) => {
  const issue = getWorkbookIssue(date)
  return await pubMediaRepository.fetchPublication({ issue, langwritten, pub: 'mwb' })
}

/**
 * Gets a publication.
 * @param publication The publication to get.
 * @returns The publication.
 */
const getPublication = async (publication: PubFetcher) => {
  return await pubMediaRepository.fetchPublication(publication)
}

/**
 * Gets a study watchtower.
 * @param langwritten The language to get the study watchtower for. Defaults to English.
 * @param date The date to get the study watchtower for. Defaults to the current month and year.
 * @returns The study watchtower.
 */
const getStudyWatchtower = async (
  langwritten: JwLangCode = 'E',
  date?: { month: number; year: number }
) => {
  const issue = getStudyWatchtowerIssue(date)
  return await pubMediaRepository.fetchPublication({ issue, langwritten, pub: 'w' })
}

/**
 * A service wrapping the publication media repository.
 */
export const pubMediaService = { getMeetingWorkbook, getPublication, getStudyWatchtower }
