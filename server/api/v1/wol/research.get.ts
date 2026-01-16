import { z } from 'zod'

const querySchema = z.object({
  book: bibleBookNrSchema,
  chapter: bibleChapterNrSchema,
  wtlocale: jwLangCodeSchema
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          BibleBookQuery: {
            description: 'A Bible book number representing the book.',
            examples: {
              1: { summary: 'Genesis', value: 1 },
              2: { summary: 'Matthew', value: 40 },
              3: { summary: 'Revelation', value: 66 }
            },
            in: 'query',
            name: 'book',
            required: true,
            schema: { maximum: 66, minimum: 1, type: 'integer' },
            summary: 'A Bible book number.'
          },
          BibleChapterQuery: {
            description: 'A Bible chapter number representing the chapter.',
            examples: {
              1: { summary: 'Chapter 1', value: 1 },
              2: { summary: 'Chapter 10', value: 10 },
              3: { summary: 'Chapter 50', value: 50 }
            },
            in: 'query',
            name: 'chapter',
            required: true,
            schema: { maximum: 150, minimum: 1, type: 'integer' },
            summary: 'A Bible chapter number.'
          }
        }
      }
    },
    description:
      'Get Bible chapter research data including footnotes, references, and cross-references from JW.org.',
    operationId: 'getBibleChapterResearch',
    parameters: [
      { $ref: '#/components/parameters/BibleBookQuery' },
      { $ref: '#/components/parameters/BibleChapterQuery' },
      { $ref: '#/components/parameters/WtLocale' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            example: {
              data: {
                crossReferences: [],
                footnotes: [],
                references: []
              },
              meta: {
                requestId: 'k7f2m9x3q1',
                responseTime: 42,
                timestamp: '2026-01-16T12:34:56.789Z',
                version: 'v1'
              },
              success: true
            },
            schema: {
              properties: {
                data: {
                  properties: {
                    crossReferences: {
                      items: { type: 'object' },
                      type: 'array'
                    },
                    footnotes: {
                      items: { type: 'object' },
                      type: 'array'
                    },
                    references: {
                      items: { type: 'object' },
                      type: 'array'
                    }
                  },
                  type: 'object'
                },
                meta: { $ref: '#/components/schemas/ApiMeta' },
                success: { enum: [true], type: 'boolean' }
              },
              required: ['success', 'data', 'meta'],
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get Bible chapter research.',
    tags: ['WOL', 'Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, wtlocale } = parseQuery(event, querySchema)

  const research = await wolService.getBibleChapterWithResearch(book, chapter, wtlocale)

  return apiSuccess(research)
})
