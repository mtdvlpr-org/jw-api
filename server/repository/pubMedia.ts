import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/pub-media'
} satisfies FetchOptions

export const pubMediaRepository = {
  fetchPublication: async (publication: PubFetcher) => {
    return await $fetch<Publication>('/GETPUBMEDIALINKS', {
      ...defaultFetchOptions,
      query: { ...publication, alllangs: '0', output: 'json', txtCMSLang: 'E' }
    })
  }
}
