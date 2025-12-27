import { pubMediaRepository } from '#server/repository/pubMedia'

export const pubMediaService = {
  getPublication: async (
    publication: PublicationBookFetcher | PublicationDocFetcher | PublicationFetcher
  ) => {
    const result = await pubMediaRepository.fetchPublication(publication)
    return result
  }
}
