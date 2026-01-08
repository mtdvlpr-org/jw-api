import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          BibleBook: {
            example: {
              bookDisplayTitle: 'Genesis',
              chapterCount: '50',
              standardName: 'Genesis',
              url: 'https://www.jw.org/en/library/bible/study-bible/books/genesis/'
            },
            properties: {
              bookDisplayTitle: { type: 'string' },
              chapterCount: { type: 'string' },
              standardName: { type: 'string' },
              url: { format: 'uri', type: 'string' }
            },
            required: ['bookDisplayTitle', 'chapterCount', 'standardName', 'url'],
            type: 'object'
          }
        }
      }
    },
    parameters: [{ $ref: '#/components/parameters/LangSymbol' }],
    responses: {
      200: {
        content: {
          'application/json': {
            example: {
              1: {
                bookDisplayTitle: 'Genesis',
                chapterCount: '50',
                standardName: 'Genesis',
                url: 'https://www.jw.org/en/library/bible/study-bible/books/genesis/'
              },
              2: {
                bookDisplayTitle: 'Exodus',
                chapterCount: '40',
                standardName: 'Exodus',
                url: 'https://www.jw.org/en/library/bible/study-bible/books/exodus/'
              },
              66: {
                bookDisplayTitle: 'Revelation',
                chapterCount: '22',
                standardName: 'Revelation',
                url: 'https://www.jw.org/en/library/bible/study-bible/books/revelation/'
              }
            },
            schema: {
              additionalProperties: { $ref: '#/components/schemas/BibleBook' },
              type: 'object'
            }
          }
        },
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

  return await bibleService.getBooks(symbol)
})
