import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'Mediator'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
} satisfies FetchOptions

/**
 * Repository for mediator resources.
 */
export const mediatorRepository = {
  /**
   * Fetches a list of categories.
   * @param locale The language of the categories.
   * @param clientType The client type.
   * @returns A list of categories.
   * @throws If the categories are not found or the service is unavailable.
   */
  fetchCategories: defineCachedFunction(
    async (locale: JwLangCode, clientType?: ClientType) => {
      try {
        const result = await $fetch<CategoriesResult>(`/categories/${locale}`, {
          ...defaultFetchOptions,
          query: { clientType }
        })

        return result.categories
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Categories not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'mediatorRepository.fetchCategories' }
  ),

  /**
   * Fetches information about a category.
   * @param locale The language of the category.
   * @param key The key of the category.
   * @param query The query parameters.
   * @returns The category information.
   * @throws If the category is not found or the service is unavailable.
   */
  fetchCategory: defineCachedFunction(
    async (locale: JwLangCode, key: CategoryKey, query?: MediatorCategoryQuery) => {
      try {
        const result = await $fetch<CategoryResult>(`/categories/${locale}/${key}`, {
          ...defaultFetchOptions,
          query
        })

        return result.category
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Category '${key}' not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24, name: 'mediatorRepository.fetchCategory' }
  ),

  /**
   * Fetches detailed information about a category.
   * @param locale The language of the category.
   * @param key The key of the category.
   * @param query The query parameters.
   * @returns The detailed category information.
   * @throws If the category is not found or the service is unavailable.
   */
  fetchCategoryDetails: defineCachedFunction(
    async (locale: JwLangCode, key: CategoryKey, query?: MediatorCategoryDetailedQuery) => {
      try {
        const result = await $fetch<CategoryResultDetailed>(`/categories/${locale}/${key}`, {
          ...defaultFetchOptions,
          query: { ...query, detailed: 1 }
        })

        return result.category
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Category details for '${key}' not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24, name: 'mediatorRepository.fetchCategoryDetails' }
  ),

  /**
   * Fetches the available languages in the Mediator API.
   * @param locale The language of the languages.
   * @returns A list of languages.
   * @throws If the languages are not found or the service is unavailable.
   */
  fetchLanguages: defineCachedFunction(
    async (locale: JwLangCode) => {
      try {
        const result = await $fetch<MediatorLanguageResult>(`/languages/${locale}/web`, {
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
    { maxAge: 60 * 60 * 24 * 30, name: 'mediatorRepository.fetchLanguages' }
  ),

  /**
   * Fetches information about a media item.
   * @param publication The publication to fetch the media item for.
   * @param clientType The client type.
   * @returns The media item information.
   * @throws If the media item is not found or the service is unavailable.
   */
  fetchMediaItem: defineCachedFunction(
    async (publication: MediaFetcher, clientType?: ClientType) => {
      const key = 'key' in publication ? publication.key : generateMediaKey(publication)

      try {
        const result = await $fetch<MediaDataResult>(
          `/media-items/${publication.langwritten}/${key}`,
          {
            ...defaultFetchOptions,
            query: { clientType }
          }
        )

        const data = result.media[0]
        if (!data) {
          throw apiNotFoundError(
            `Media item '${key}' not found for locale '${publication.langwritten}'`
          )
        }

        return data
      } catch (error) {
        if (isApiError(error)) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Media item '${key}' not found for locale '${publication.langwritten}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24, name: 'mediatorRepository.fetchMediaItem' }
  ),

  /**
   * Fetches the translations of strings in the Mediator API.
   * @param locale The language of the strings.
   * @returns A record of translations.
   * @throws If the translations are not found or the service is unavailable.
   */
  fetchTranslations: defineCachedFunction(
    async <T extends JwLangCode>(locale: T): Promise<Record<string, string>> => {
      try {
        const result = await $fetch<{ translations: Record<T, Record<string, string>> }>(
          `/translations/${locale}`,
          { ...defaultFetchOptions }
        )
        return result.translations[locale]
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Translations not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'mediatorRepository.fetchTranslations' }
  )
}
