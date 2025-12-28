import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://jw.org'
} satisfies FetchOptions

export const jwRepository = {
  fetchLanguages: async (locale: JwLangSymbol) => {
    const result = await $fetch<JwLanguageResult>(`/${locale}/languages/`, {
      ...defaultFetchOptions
    })

    return result.languages
  }
}
