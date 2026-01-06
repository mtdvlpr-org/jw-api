import { z } from 'zod'

const routeSchema = z.object({
  book: bibleBookNrSchema(),
  symbol: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBook({ book, locale: symbol })
})
