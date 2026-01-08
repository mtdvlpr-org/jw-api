/**
 * Gets the meeting publications for a given date.
 * @param date The week to get the meeting publications for. Defaults to the current week.
 * @returns The meeting publications.
 */
const getMeetingPublications = async (date?: { week: number; year: number }) => {
  // Make sure the catalog is loaded
  await catalogService.getCatalog()

  // Get the Monday of the week
  const monday = getMondayOfWeek(date)

  // Get the meeting publications
  const [mwb, w] = await Promise.allSettled([
    catalogService.getPublicationForDate('mwb', 'E', monday),
    catalogService.getPublicationForDate('w', 'E', monday)
  ])

  // Either publication can be null if publication is not released yet or for the Memorial week.
  return {
    watchtower: w.status === 'fulfilled' ? w.value : null,
    workbook: mwb.status === 'fulfilled' ? mwb.value : null
  }
}

const getMeetingArticles = async (
  langwritten: JwLangCode,
  date?: { week: number; year: number }
) => {
  const { watchtower, workbook } = await getMeetingPublications(date)

  const wtYear = watchtower ? +watchtower.issue.slice(0, 4) : null
  const wtMonth = watchtower ? +watchtower.issue.slice(4) : null

  const mwbYear = workbook ? +workbook.issue.slice(0, 4) : null
  const mwbMonth = workbook ? +workbook.issue.slice(4) : null

  logger.debug(`wtYear: ${wtYear}`)
  logger.debug(`wtMonth: ${wtMonth}`)
  logger.debug(`mwbYear: ${mwbYear}`)
  logger.debug(`mwbMonth: ${mwbMonth}`)

  const [wtPub, mwbPub] = await Promise.allSettled([
    watchtower && wtMonth && wtYear
      ? await pubMediaService.getStudyWatchtower({
          date: { month: wtMonth, year: wtYear },
          fileformat: 'JWPUB',
          langwritten
        })
      : null,
    workbook && mwbMonth && mwbYear
      ? await pubMediaService.getMeetingWorkbook({
          date: { month: mwbMonth, year: mwbYear },
          fileformat: 'JWPUB',
          langwritten
        })
      : null
  ])

  logger.debug(
    `wtPub: ${wtPub.status === 'fulfilled' && !!wtPub.value?.files[langwritten]?.JWPUB?.[0]}`
  )
  logger.debug(
    `mwbPub: ${mwbPub.status === 'fulfilled' && !!mwbPub.value?.files[langwritten]?.JWPUB?.[0]}`
  )

  const monday = getMondayOfWeek(date)

  const [wtArticle, mwbArticle] = await Promise.allSettled([
    wtPub.status === 'fulfilled' && wtPub.value?.files[langwritten]?.JWPUB?.[0]
      ? jwpubService.getWtArticleForDate(wtPub.value.files[langwritten].JWPUB[0].file.url, monday)
      : null,
    mwbPub.status === 'fulfilled' && mwbPub.value?.files[langwritten]?.JWPUB?.[0]
      ? jwpubService.getMwbArticleForDate(mwbPub.value.files[langwritten].JWPUB[0].file.url, monday)
      : null
  ])

  logger.debug(
    `wtArticle: ${wtArticle.status === 'fulfilled' && wtArticle.value ? 'true' : 'false'}`
  )
  logger.debug(
    `mwbArticle: ${mwbArticle.status === 'fulfilled' && mwbArticle.value ? 'true' : 'false'}`
  )

  return {
    watchtower: wtArticle.status === 'fulfilled' && wtArticle.value ? wtArticle.value : null,
    workbook: mwbArticle.status === 'fulfilled' && mwbArticle.value ? mwbArticle.value : null
  }
}

const getMeetingSchedule = async (
  langwritten: JwLangCode,
  date?: { week: number; year: number }
) => {
  const { watchtower, workbook } = await getMeetingPublications(date)

  const wtYear = watchtower ? +watchtower.issue.slice(0, 4) : null
  const wtMonth = watchtower ? +watchtower.issue.slice(4) : null

  const mwbYear = workbook ? +workbook.issue.slice(0, 4) : null
  const mwbMonth = workbook ? +workbook.issue.slice(4) : null

  const [wtPub, mwbPub] = await Promise.allSettled([
    watchtower && wtMonth && wtYear
      ? await pubMediaService.getWtJwpub({
          date: { month: wtMonth, year: wtYear },
          langwritten
        })
      : null,
    workbook && mwbMonth && mwbYear
      ? await pubMediaService.getMwbJwpub({
          date: { month: mwbMonth, year: mwbYear },
          langwritten
        })
      : null
  ])

  const [wtSchedule, mwbSchedule] = await Promise.allSettled([
    wtPub.status === 'fulfilled' && wtPub.value ? getPublicationSchedule(wtPub.value, 'wt') : null,
    mwbPub.status === 'fulfilled' && mwbPub.value
      ? getPublicationSchedule(mwbPub.value, 'mwb')
      : null
  ])

  const monday = formatDate(getMondayOfWeek(date), 'YYYY/MM/DD')

  return {
    watchtower:
      wtSchedule.status === 'fulfilled' && wtSchedule.value
        ? wtSchedule.value.find((s) => s.w_study_date === monday)
        : null,
    workbook:
      mwbSchedule.status === 'fulfilled' && mwbSchedule.value
        ? mwbSchedule.value.find((s) => s.mwb_week_date === monday)
        : null
  }
}

export const meetingService = { getMeetingArticles, getMeetingPublications, getMeetingSchedule }
