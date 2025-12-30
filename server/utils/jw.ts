import { jwRepository } from '#server/repository/jw'

/**
 * Gets the languages for a given locale.
 * @param locale The locale to get the languages for. Defaults to English.
 * @param webOnly Whether to only return languages with web content. Defaults to true.
 * @returns The languages.
 */
const getLanguages = async (locale: JwLangSymbol = 'en', webOnly = true) => {
  const result = await jwRepository.fetchLanguages(locale)

  return webOnly ? result.filter((l) => l.hasWebContent) : result
}

/**
 * A service wrapping the JW repository.
 */
export const jwService = { getLanguages }
