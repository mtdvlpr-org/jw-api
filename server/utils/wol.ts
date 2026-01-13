import { wolRepository } from '#server/repository/wol'

/**
 * Gets the yeartext for a given locale and year.
 * @param locale The locale to get the yeartext for. Defaults to English.
 * @param year The year to get the yeartext for. Defaults to the current year.
 * @returns The yeartext.
 */
const getYeartext = async (locale: JwLangCode = 'E', year?: number) => {
  const usedYear = year ?? new Date().getFullYear()
  return await wolRepository.fetchYeartext(locale, usedYear)
}

/**
 * Gets the WOL base URL for a given locale.
 * @param locale The locale to get the base URL for.
 * @returns The WOL base URL.
 */
const getBaseUrl = async (locale: JwLangCode) => {
  const homepage = await wolRepository.fetchHomepage(locale)
  return homepage.url
}

/**
 * Gets the URL for a specific Bible chapter in a given locale.
 * @param book The book number.
 * @param chapter The chapter number.
 * @param locale The locale.
 * @returns The URL for the Bible chapter.
 */
const getBibleChapterUrl = async (book: BibleBookNr, chapter: number, locale: JwLangCode = 'E') => {
  const baseUrl = await getBaseUrl(locale)
  return `${baseUrl.replace('/h/', '/b/')}/nwtsty/${book}/${chapter}#study=discover`
}

/**
 * Gets the yeartext details for a given locale and year.
 * @param locale The locale to get the yeartext details for. Defaults to English.
 * @param year The year to get the yeartext details for. Defaults to the current year.
 * @returns The yeartext details.
 */
const getYeartextDetails = async (locale: JwLangCode = 'E', year?: number) => {
  const usedYear = year ?? new Date().getFullYear()

  const result = await wolRepository.fetchYeartextDetails(locale, usedYear)

  const html = parseHtml(result.title)

  return { parsedTitle: html.innerText, result, year: usedYear }
}

const getBibleChapterInfo = async (
  book: BibleBookNr,
  chapter: number,
  locale: JwLangCode = 'E'
) => {
  const data = await scrapeBibleChapter(book, chapter, locale)
  return data
}

const getBibleChapterWithResearch = async (
  book: BibleBookNr,
  chapter: number,
  locale: JwLangCode = 'E'
) => {
  const data = await scrapeBibleChapter(book, chapter, locale)
  const verses: typeof data.verses = {}

  for (const [verse, info] of Object.entries(data.verses)) {
    const researchGuidePromises = info.researchGuide.map(async (rg) => {
      if (!rg.path) return rg

      const refResult = await wolRepository.fetchReference(rg.path)
      return {
        ...rg,
        content: refResult.content,
        pubTitle: refResult.publicationTitle,
        title: refResult.title
      }
    })

    const researchGuide = await Promise.all(researchGuidePromises)

    verses[verse] = {
      ...info,
      researchGuide
    }
  }

  return { ...data, verses }
}

/**
 * A service wrapping the WOL repository.
 */
export const wolService = {
  getBibleChapterInfo,
  getBibleChapterUrl,
  getBibleChapterWithResearch,
  getYeartext,
  getYeartextDetails
}
