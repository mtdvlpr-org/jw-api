import { z } from 'zod'

const routeSchema = z.object({
  book: bibleBookNrSchema,
  chapter: bibleChapterNrSchema,
  symbol: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getChapter({ book, chapter, locale: symbol })
})
