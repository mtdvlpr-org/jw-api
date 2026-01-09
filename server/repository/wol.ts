import type { FetchOptions } from 'ofetch'

const yeartextUrls = new Map<string, string>()

const getYeartextKey = (wtlocale: JwLangCode, year: number) => `${wtlocale}-${year}`

const defaultFetchOptions = {
  baseURL: 'https://wol.jw.org'
} satisfies FetchOptions

/**
 * Fetches the information about a yeartext.
 * @param wtlocale The language of the yeartext.
 * @param year The year of the yeartext.
 * @returns The information about the yeartext.
 */
const fetchYeartextResult = defineCachedFunction(
  async (wtlocale: JwLangCode, year: number) => {
    try {
      const result = await $fetch<YeartextResult>(`/wol/finder`, {
        ...defaultFetchOptions,
        query: { docid: `110${year}800`, format: 'json', snip: 'yes', wtlocale }
      })

      yeartextUrls.set(getYeartextKey(wtlocale, year), result.jsonUrl)

      return result
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Yeartext not found for language '${wtlocale}' and year ${year}`,
        serviceName: 'WOL'
      })
    }
  },
  { maxAge: 60 * 60 * 24 * 30, name: 'wolRepository.fetchYeartextResult' }
)

/**
 * Repository for WOL resources.
 */
export const wolRepository = {
  /**
   * Fetches the yeartext for a given year.
   * @param wtlocale The language of the yeartext.
   * @param year The year of the yeartext.
   * @returns The yeartext content.
   * @throws If the yeartext is not found or the service is unavailable.
   */
  fetchYeartext: async (wtlocale: JwLangCode, year: number) => {
    const result = await fetchYeartextResult(wtlocale, year)
    return result.content
  },

  /**
   * Fetches the details of a yeartext.
   * @param wtlocale The language of the yeartext.
   * @param year The year of the yeartext.
   * @returns The details of the yeartext.
   * @throws If the yeartext is not found or the service is unavailable.
   */
  fetchYeartextDetails: defineCachedFunction(
    async (wtlocale: JwLangCode, year: number) => {
      try {
        const key = getYeartextKey(wtlocale, year)
        if (yeartextUrls.has(key)) {
          return await $fetch<YeartextDetails>(yeartextUrls.get(key)!, { ...defaultFetchOptions })
        }

        const result = await fetchYeartextResult(wtlocale, year)

        yeartextUrls.set(getYeartextKey(wtlocale, year), result.jsonUrl)

        return await $fetch<YeartextDetails>(result.jsonUrl, { ...defaultFetchOptions })
      } catch (error) {
        // If it's already an API error (from fetchYeartextResult), re-throw it
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Yeartext details not found for language '${wtlocale}' and year ${year}`,
          serviceName: 'WOL'
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'wolRepository.fetchYeartextDetails' }
  )
}
