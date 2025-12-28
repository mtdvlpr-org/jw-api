import { pubMediaRepository } from '#server/repository/pubMedia'

export const pubMediaService = {
  getPublication: async (publication: PubFetcher) => {
    const result = await pubMediaRepository.fetchPublication(publication)
    return result
  },
  getStudyWatchtower: async (langwritten: JwLangCode, date?: { month: number; year: number }) => {
    const issue = getStudyWatchtowerIssue(date)
    return await pubMediaRepository.fetchPublication({ issue, langwritten, pub: 'w' })
  },
  getWorkbook: async (langwritten: JwLangCode, date?: { month: number; year: number }) => {
    const issue = getWorkbookIssue(date)
    return await pubMediaRepository.fetchPublication({ issue, langwritten, pub: 'mwb' })
  }
}
