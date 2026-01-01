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

  const monday = getMondayOfWeek(date)

  const [wtArticle, mwbArticle] = await Promise.allSettled([
    wtPub.status === 'fulfilled' && wtPub.value?.files[langwritten]?.JWPUB?.[0]
      ? jwpubService.getWtArticleForDate(wtPub.value.files[langwritten].JWPUB[0].file.url, monday)
      : null,
    mwbPub.status === 'fulfilled' && mwbPub.value?.files[langwritten]?.JWPUB?.[0]
      ? jwpubService.getMwbArticleForDate(mwbPub.value.files[langwritten].JWPUB[0].file.url, monday)
      : null
  ])

  return {
    watchtower: wtArticle.status === 'fulfilled' && wtArticle.value ? wtArticle.value : null,
    workbook: mwbArticle.status === 'fulfilled' && mwbArticle.value ? mwbArticle.value : null
  }
}

export const meetingService = { getMeetingArticles, getMeetingPublications }
