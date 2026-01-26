import { z } from 'zod'

const routeSchema = z.strictObject({
  book: bibleBookNrSchema,
  chapter: bibleChapterNrSchema,
  symbol: jwLangSymbolSchema,
  verse: bibleVerseNrSchema
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          BibleVerse: {
            description: 'A Bible verse number representing the verse.',
            examples: {
              1: { summary: 'Verse 1', value: 1 },
              2: { summary: 'Verse 10', value: 10 },
              3: { summary: 'Verse 176', value: 176 }
            },
            in: 'path',
            name: 'verse',
            required: true,
            schema: { maximum: 176, minimum: 1, type: 'integer' },
            summary: 'A Bible verse number.'
          }
        },
        schemas: {
          BibleVerse: {
            example: {
              abbreviatedCitation: 'Ge&nbsp;1:1',
              bookNumber: 1,
              chapterNumber: 1,
              content: `<span class="style-b"><span class="chapterNum"><a href='/en/library/bible/study-bible/books/json/data/1001001#v1001001' data-anchor='#v1001001'>1 </a></span> In the beginning God created the heavens and the earth.<xref id="210572864"></xref></span>\r\n<span class="parabreak"></span>`,
              standardCitation: 'Genesis&nbsp;1:1',
              verseNumber: 1,
              vsID: '1001001'
            },
            properties: {
              abbreviatedCitation: { format: 'html', type: 'string' },
              bookNumber: { maximum: 66, minimum: 1, type: 'integer' },
              chapterNumber: { maximum: 150, minimum: 1, type: 'integer' },
              content: { format: 'html', type: 'string' },
              standardCitation: { format: 'html', type: 'string' },
              verseNumber: { type: 'integer' },
              vsID: { type: 'string' }
            },
            required: [
              'abbreviatedCitation',
              'bookNumber',
              'chapterNumber',
              'content',
              'standardCitation',
              'verseNumber',
              'vsID'
            ],
            type: 'object'
          }
        }
      }
    },
    description: 'Get a Bible verse by book, chapter, and verse number.',
    operationId: 'getBibleVerse',
    parameters: [
      { $ref: '#/components/parameters/LangSymbol' },
      { $ref: '#/components/parameters/BibleBook' },
      { $ref: '#/components/parameters/BibleChapter' },
      { $ref: '#/components/parameters/BibleVerse' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: {
                  properties: {
                    parsedContent: {
                      example: 'In the beginning God created the heavens and the earth.',
                      type: 'string'
                    },
                    result: { $ref: '#/components/schemas/BibleVerse' }
                  },
                  required: ['parsedContent', 'result'],
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
    summary: 'Get Bible verse.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol, verse } = parseRouteParams(event, routeSchema)

  const result = await bibleService.getVerse({ book, chapter, locale: symbol, verse })
  return apiSuccess(result)
})
