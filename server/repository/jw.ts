import type { FetchOptions } from 'ofetch'

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
   * Fetches the available languages on JW.org.
   * @param locale The language of the languages.
   * @returns A list of languages.
   */
  fetchLanguages: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      const result = await $fetch<JwLanguageResult>(`/${locale}/languages/`, {
        ...defaultFetchOptions
      })

      return result.languages
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'jwRepository.fetchLanguages' }
  )
}
