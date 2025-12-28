import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
} satisfies FetchOptions

export const mediatorRepository = {
  fetchCategories: async (locale: JwLangCode, clientType?: ClientType) => {
    console.log('fetchCategories', locale, clientType)
    const result = await $fetch<CategoriesResult>(`/categories/${locale}`, {
      ...defaultFetchOptions,
      query: { clientType }
    })

    return result.categories
  },
  fetchCategory: async (locale: JwLangCode, key: CategoryKey, query?: MediatorCategoryQuery) => {
    console.log('fetchCategory', locale, key, query)
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
    console.log('fetchCategoryDetails', locale, key, query)
    const result = await $fetch<CategoryResultDetailed>(`/categories/${locale}/${key}`, {
      ...defaultFetchOptions,
      query: { ...query, detailed: 1 }
    })

    return result.category
  },
  fetchLanguages: async (locale: JwLangCode) => {
    console.log('fetchLanguages', locale)
    const result = await $fetch<MediatorLanguageResult>(`/languages/${locale}/web`, {
      ...defaultFetchOptions
    })

    return result.languages
  },
  fetchMediaItem: async (publication: MediaFetcher, clientType?: ClientType) => {
    console.log('fetchMediaItem', publication, clientType)
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
    console.log('fetchTranslations', locale)
    const result = await $fetch<{ translations: Record<T, Record<string, string>> }>(
      `/translations/${locale}`,
      { ...defaultFetchOptions }
    )
    return result.translations[locale]
  }
}
