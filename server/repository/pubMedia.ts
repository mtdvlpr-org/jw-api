import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'PubMedia'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/pub-media'
} satisfies FetchOptions

/**
 * Repository for publication media resources.
 */
export const pubMediaRepository = {
  /**
   * Fetches information about a publication.
   * @param publication The publication to fetch information for.
   * @returns The publication information.
   * @throws If the publication is not found or the service is unavailable.
   */
  fetchPublication: defineCachedFunction(
    async (publication: PubFetcher) => {
      try {
        return await $fetch<Publication>('/GETPUBMEDIALINKS', {
          ...defaultFetchOptions,
          query: { ...publication, alllangs: '0', output: 'json', txtCMSLang: 'E' }
        })
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Publication '${publication.pub}' not found`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24, name: 'pubMediaRepository.fetchPublication' }
  )
}
