import { jwRepository } from '#server/repository/jw'

export const jwService = {
  getLanguages: async (locale: JwLangSymbol = 'en', webOnly = true) => {
    const result = await jwRepository.fetchLanguages(locale)

    return webOnly ? result.filter((l) => l.hasWebContent) : result
  }
}
