import type { FetchOptions } from 'ofetch'

const yeartextUrls = new Map<string, string>()

const getYeartextKey = (wtlocale: JwLangCode, year: number) => `${wtlocale}-${year}`

const defaultFetchOptions = {
  baseURL: 'https://wol.jw.org'
} satisfies FetchOptions

const fetchYeartextResult = async (wtlocale: JwLangCode, year: number) => {
  const result = await $fetch<YeartextResult>(`/wol/finder`, {
    ...defaultFetchOptions,
    query: { docid: `110${year}800`, format: 'json', snip: 'yes', wtlocale }
  })

  yeartextUrls.set(getYeartextKey(wtlocale, year), result.jsonUrl)

  return result
}

export const wolRepository = {
  fetchYeartext: async (wtlocale: JwLangCode, year: number) => {
    const result = await fetchYeartextResult(wtlocale, year)
    return result.content
  },
  fetchYeartextDetails: async (wtlocale: JwLangCode, year: number) => {
    const key = getYeartextKey(wtlocale, year)
    if (yeartextUrls.has(key)) {
      return await $fetch<YeartextDetails>(yeartextUrls.get(key)!, { ...defaultFetchOptions })
    }

    const result = await fetchYeartextResult(wtlocale, year)

    yeartextUrls.set(getYeartextKey(wtlocale, year), result.jsonUrl)

    return await $fetch<YeartextDetails>(result.jsonUrl, { ...defaultFetchOptions })
  }
}
