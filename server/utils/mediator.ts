import { mediatorRepository } from '#server/repository/mediator'

const getMediaWithSubtitles = async (publication: MediaFetcher) => {
  const video = await mediatorRepository.fetchMediaItem(publication)

  const bestMatch = findBestFile(video?.files ?? [], true)

  if (!bestMatch) throw new Error('No subtitles found')

  return { bestMatch, publication, video }
}

export const mediatorService = {
  getCategories: async (locale: JwLangCode = 'E') => {
    const categories = await mediatorRepository.fetchCategories(locale)
    return categories
  },
  getCategory: async (
    key: CategoryKey,
    {
      locale = 'E',
      query
    }: {
      locale?: JwLangCode
      query?: MediatorCategoryQuery
    }
  ) => {
    const category = await mediatorRepository.fetchCategory(locale, key, query)
    return category
  },
  getDetailedCategory: async (
    key: CategoryKey,
    {
      locale = 'E',
      query
    }: {
      locale?: JwLangCode
      query?: MediatorCategoryDetailedQuery
    } = {}
  ) => {
    const category = await mediatorRepository.fetchCategoryDetails(locale, key, query)
    return category
  },
  getLanguages: async (locale: JwLangCode = 'E') => {
    const languages = await mediatorRepository.fetchLanguages(locale)
    return languages
  },
  getMediaItem: async (publication: MediaFetcher, clientType: ClientType = 'www') => {
    const mediaItem = await mediatorRepository.fetchMediaItem(publication, clientType)
    return mediaItem
  },
  getMediaWithSubtitles,
  getSubtitles: async (publication: MediaFetcher) => {
    const { bestMatch, video } = await getMediaWithSubtitles(publication)

    if (!bestMatch?.subtitles) throw new Error('No subtitles found')

    const subtitles = await $fetch<string>(bestMatch.subtitles.url, { responseType: 'text' })

    return { bestMatch, publication, subtitles, video }
  },
  getTranslations: async (locale: JwLangCode = 'E') => {
    const translations = await mediatorRepository.fetchTranslations(locale)
    return translations
  }
}
