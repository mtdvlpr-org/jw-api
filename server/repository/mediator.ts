import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
} satisfies FetchOptions

export const mediatorRepository = {
  fetchCategories: async (locale: JwLangCode, clientType?: ClientType) => {
    const result = await $fetch<CategoriesResult>(`/categories/${locale}`, {
      ...defaultFetchOptions,
      query: { clientType }
    })

    return result.categories
  },
  fetchCategory: async (locale: JwLangCode, key: CategoryKey, query?: MediatorCategoryQuery) => {
    const result = await $fetch<CategoryResult>(`/categories/${locale}/${key}`, {
      ...defaultFetchOptions,
      query
    })

    return result.category
  },
  fetchCategoryDetails: async (
    locale: JwLangCode,
    key: CategoryKey,
    query?: MediatorCategoryDetailedQuery
  ) => {
    const result = await $fetch<CategoryDetailedResult>(`/categories/${locale}/${key}`, {
      ...defaultFetchOptions,
      query: { ...query, detailed: 1 }
    })

    return result.category
  },
  fetchLanguages: async (locale: JwLangCode) => {
    const result = await $fetch<MediatorLanguageResult>(`/languages/${locale}/web`, {
      ...defaultFetchOptions
    })

    return result.languages
  },
  fetchMediaItem: async (
    publication:
      | PublicationDocFetcher
      | PublicationFetcher
      | { key: MediaKey; langwritten: JwLangCode },
    clientType: ClientType = 'www'
  ) => {
    const key = 'key' in publication ? publication.key : generateMediaKey(publication)

    const result = await $fetch<MediaDataResult>(`/media-items/${publication.langwritten}/${key}`, {
      ...defaultFetchOptions,
      query: { clientType }
    })

    const data = result.media[0]
    if (!data) throw new Error(`Not Found: ${publication.langwritten}/${key}`)

    return data
  },
  fetchTranslations: async <T extends JwLangCode>(locale: T): Promise<Record<string, string>> => {
    const result = await $fetch<{ translations: Record<T, Record<string, string>> }>(
      `/translations/${locale}`,
      { ...defaultFetchOptions }
    )
    return result.translations[locale]
  }
}
