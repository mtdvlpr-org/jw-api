import { z } from 'zod'

const querySchema = z.union([pubBibleFetcherSchema, pubDocFetcherSchema, pubFetcherSchema])

export default defineLoggedEventHandler(async (event) => {
  const publication = await getValidatedQuery(event, querySchema.parse)

  const result = await pubMediaService.getPublication(publication)

  return result
})
