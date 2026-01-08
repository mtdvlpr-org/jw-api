import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          BibleData: {
            example: {
              additionalPages: [],
              copyrightPage: {},
              currentLocale: 'en',
              editionData: {
                bookCount: '66',
                books: {},
                locale: 'en',
                titleFormat: 'short',
                url: 'https://www.jw.org/en/library/bible/study-bible/',
                vernacularAbbreviation: 'nwtsty',
                vernacularFullName: 'New World Translation of the Holy Scriptures (Study Edition)',
                vernacularShortName: 'Study Bible'
              },
              ranges: [],
              status: 200
            },
            properties: {
              additionalPages: { items: { type: 'object' }, type: 'array' },
              copyrightPage: { type: 'object' },
              currentLocale: { type: 'string' },
              editionData: {
                properties: {
                  bookCount: { type: 'string' },
                  books: { additionalProperties: { type: 'object' }, type: 'object' },
                  locale: { type: 'string' },
                  titleFormat: { type: 'string' },
                  url: { type: 'string' },
                  vernacularAbbreviation: { type: 'string' },
                  vernacularFullName: { type: 'string' },
                  vernacularShortName: { type: 'string' }
                },
                type: 'object'
              },
              ranges: { items: { type: 'object' }, maxItems: 0, minItems: 0, type: 'array' },
              status: { type: 'number' }
            },
            type: 'object'
          }
        }
      }
    },
    parameters: [{ $ref: '#/components/parameters/LangSymbol' }],
    responses: {
      200: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/BibleData' } } },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBibleData(symbol)
})
