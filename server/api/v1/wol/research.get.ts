import { z } from 'zod'

const querySchema = z.object({
  book: bibleBookNrSchema,
  chapter: bibleChapterNrSchema,
  wtlocale: jwLangCodeSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, wtlocale } = parseQuery(event, querySchema)

  const research = await wolService.getBibleChapterWithResearch(book, chapter, wtlocale)

  return apiSuccess(research)
})
