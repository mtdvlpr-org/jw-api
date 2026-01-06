import { z } from 'zod'

const querySchema = z.union([
  z.object({
    booknum: bibleBookNrSchema(),
    fileformat: publicationFileFormatSchema.optional(),
    langwritten: jwLangCodeSchema,
    pub: z.literal('nwt').describe('The publication key.')
  }),
  z.object({
    docid: z.coerce.number<string>().int().positive().describe('The document ID.'),
    fileformat: publicationFileFormatSchema.optional(),
    langwritten: jwLangCodeSchema,
    track: z.number().int().positive().optional().describe('The track number.')
  }),
  z.object({
    fileformat: publicationFileFormatSchema.optional(),
    issue: z.coerce.number<string>().int().positive().optional().describe('The issue number.'),
    langwritten: jwLangCodeSchema,
    pub: z.string().describe('The publication key.'),
    track: z.coerce.number<string>().int().positive().optional().describe('The track number.')
  })
])

export default defineLoggedEventHandler(async (event) => {
  const publication = await getValidatedQuery(event, querySchema.parse)

  const result = await pubMediaService.getPublication(publication)

  return result
})
