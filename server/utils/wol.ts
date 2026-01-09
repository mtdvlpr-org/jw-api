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

/**
 * A service wrapping the WOL repository.
 */
export const wolService = { getYeartext, getYeartextDetails }
