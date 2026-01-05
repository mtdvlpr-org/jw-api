import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

export default defineLoggedEventHandler(async (event) => {
  const { symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBooks(symbol)
})
