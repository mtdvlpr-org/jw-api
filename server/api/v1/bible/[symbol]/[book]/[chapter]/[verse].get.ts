import { z } from 'zod'

const routeSchema = z.object({
  book: bibleBookNrSchema(),
  chapter: bibleChapterNrSchema(),
  symbol: jwLangSymbolSchema,
  verse: bibleVerseNrSchema()
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol, verse } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getVerse({ book, chapter, locale: symbol, verse })
})
