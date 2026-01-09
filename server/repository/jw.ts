import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'JW.org'

const defaultFetchOptions = {
  baseURL: 'https://jw.org',
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)'
  },
  retry: 2,
  retryDelay: 1000,
  timeout: 30000
} satisfies FetchOptions

/**
 * Repository for JW.org resources.
 */
export const jwRepository = {
  /**
   * Fetches the homepage HTML for a given locale.
   * @param locale The language of the homepage.
   * @returns The homepage HTML.
   * @throws If the homepage is not found or the service is unavailable.
   */
  fetchHomepage: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      try {
        const result = await $fetch<string>(`/${locale}/`, {
          ...defaultFetchOptions,
          responseType: 'text'
        })

        return result
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Homepage not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'jwRepository.fetchHomepage' }
  ),
  /**
   * Fetches the available languages on JW.org.
   * @param locale The language of the languages.
   * @returns A list of languages.
   * @throws If the languages are not found or the service is unavailable.
   */
  fetchLanguages: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      try {
        const result = await $fetch<JwLanguageResult>(`/${locale}/languages/`, {
          ...defaultFetchOptions
        })

        return result.languages
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Languages not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'jwRepository.fetchLanguages' }
  )
}
