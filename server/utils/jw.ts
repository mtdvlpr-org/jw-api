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
 * Gets a language by name.
 * @param name The name of the language.
 * @param locale The locale to get the language for. Defaults to English.
 * @returns The language.
 */
const getLanguage = async (name: string, locale: JwLangSymbol = 'en') => {
  const result = await jwRepository.fetchLanguages(locale)
  const normalizedName = name.toLowerCase()
  const match = result.find(
    (l) =>
      l.name.toLowerCase() === normalizedName || l.vernacularName.toLowerCase() === normalizedName
  )
  if (!match) throw apiNotFoundError(`Language '${name}' not found`)

  return match
}

/**
 * A service wrapping the JW repository.
 */
export const jwService = { getLanguage, getLanguages }
