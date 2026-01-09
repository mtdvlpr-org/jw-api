import type { ReadableStream } from 'node:stream/web'
import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'Catalog'

const defaultFetchOptions = {
  baseURL: 'https://app.jw-cdn.org/catalogs/publications/v4'
} satisfies FetchOptions

/**
 * Repository for publication catalog resources.
 */
export const catalogRepository = {
  /**
   * Fetches a publication catalog.
   * @param id The id of the catalog to fetch.
   * @returns The catalog as a stream.
   * @throws If the catalog is not found or the service is unavailable.
   */
  fetchCatalog: async (id: string) => {
    try {
      return await $fetch<ReadableStream>(`/${id}/catalog.db.gz`, {
        ...defaultFetchOptions,
        responseType: 'stream'
      })
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Catalog '${id}' not found`,
        serviceName: SERVICE_NAME
      })
    }
  },

  /**
   * Fetches the catalog manifest.
   * @returns The catalog manifest.
   * @throws If the manifest is not found or the service is unavailable.
   */
  fetchManifest: async () => {
    try {
      return await $fetch<CatalogManifest>('/manifest.json', { ...defaultFetchOptions })
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: 'Catalog manifest not found',
        serviceName: SERVICE_NAME
      })
    }
  }
}
