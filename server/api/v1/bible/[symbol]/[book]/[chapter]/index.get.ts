import { z } from 'zod'

const routeSchema = z.object({
  book: bibleBookNrSchema,
  chapter: bibleChapterNrSchema,
  symbol: jwLangSymbolSchema
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          BibleChapter: {
            description: 'A Bible chapter number representing the chapter.',
            examples: {
              1: { summary: 'Chapter 1', value: 1 },
              2: { summary: 'Chapter 10', value: 10 },
              3: { summary: 'Chapter 50', value: 50 }
            },
            in: 'path',
            name: 'chapter',
            required: true,
            schema: { maximum: 150, minimum: 1, type: 'integer' },
            summary: 'A Bible chapter number.'
          }
        },
        schemas: {
          BibleChapterOutline: {
            example: {
              content:
                '<ul><li class="L1">\n\n<p id="p3" data-pid="3">Creation of heavens and earth <span class="altsize">(</span><a class=\' jsBibleLink\' data-bible=\'nwtsty\' data-requested-bible=\'nwtsty\' data-targetverses=\'1001001-1001002\' href=\'/en/library/bible/study-bible/books/genesis/1/#v1001001-v1001002\' target=\'_blank\'><span class="altsize">1, 2</span></a><span class="altsize">)</span></p>\n\n\n\n\n</li><li class="L1">\n\n<p id="p4" data-pid="4">Six days of preparing the earth <span class="altsize">(</span><a class=\' jsBibleLink\' data-bible=\'nwtsty\' data-requested-bible=\'nwtsty\' data-targetverses=\'1001003-1001031\' href=\'/en/library/bible/study-bible/books/genesis/1/#v1001003-v1001031\' target=\'_blank\'><span class="altsize">3-31</span></a><span class="altsize">)</span></p>\n\n\n\n\n<ul>',
              id: 210572701,
              source: '1001000-1001999',
              title: 'Genesis Outline',
              type: 'outline'
            },
            properties: {
              content: { format: 'html', type: 'string' },
              id: { type: 'integer' },
              source: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' }
            },
            required: ['content', 'id', 'source', 'title', 'type'],
            type: 'object'
          },
          BibleCommentary: {
            type: 'object'
          },
          BibleCrossReference: {
            example: {
              id: 210572864,
              source: '1001001',
              targets: [
                {
                  abbreviatedCitation: 'Ps&nbsp;102:25',
                  category: {
                    id: '1',
                    label: 'General'
                  },
                  standardCitation: 'Psalm&nbsp;102:25',
                  vs: '19102025'
                }
              ]
            },
            properties: {
              id: { type: 'integer' },
              source: { type: 'string' },
              targets: {
                items: {
                  properties: {
                    abbreviatedCitation: { format: 'html', type: 'string' },
                    category: {
                      properties: {
                        id: { type: 'string' },
                        label: { type: 'string' }
                      },
                      required: ['id', 'label'],
                      type: 'object'
                    },
                    standardCitation: { format: 'html', type: 'string' },
                    vs: { type: 'string' }
                  },
                  required: ['vs', 'standardCitation', 'category', 'abbreviatedCitation'],
                  type: 'object'
                },
                type: 'array'
              }
            },
            required: ['id', 'source', 'targets'],
            type: 'object'
          },
          BibleFootnote: {
            example: {
              anchor: 'fn210572938',
              content: `<span class="">Or “empty.”</span>`,
              id: 210572938,
              source: '1001002'
            },
            properties: {
              anchor: { type: 'string' },
              content: { format: 'html', type: 'string' },
              id: { type: 'integer' },
              source: { type: 'string' }
            },
            required: ['anchor', 'content', 'id', 'source'],
            type: 'object'
          },
          BibleMultimedia: {
            type: 'object'
          },
          BiblePubReference: {
            type: 'object'
          },
          BibleRange: {
            properties: {
              chapterOutlines: {
                items: { $ref: '#/components/schemas/BibleChapterOutline' },
                type: 'array'
              },
              citation: { format: 'html', type: 'string' },
              citationVerseRange: { type: 'string' },
              commentaries: {
                items: { $ref: '#/components/schemas/BibleCommentary' },
                type: 'array'
              },
              crossReferences: {
                items: { $ref: '#/components/schemas/BibleCrossReference' },
                type: 'array'
              },
              footnotes: { items: { $ref: '#/components/schemas/BibleFootnote' }, type: 'array' },
              html: { format: 'html', type: 'string' },
              link: { format: 'uri', type: 'string' },
              multimedia: {
                items: { $ref: '#/components/schemas/BibleMultimedia' },
                type: 'array'
              },
              pubReferences: {
                items: { $ref: '#/components/schemas/BiblePubReference' },
                type: 'array'
              },
              superscriptions: {
                items: { $ref: '#/components/schemas/BibleSuperscription' },
                type: 'array'
              },
              validRange: { type: 'string' },
              verses: { items: { $ref: '#/components/schemas/BibleVerse' }, type: 'array' }
            },
            required: [
              'chapterOutlines',
              'citation',
              'citationVerseRange',
              'commentaries',
              'crossReferences',
              'footnotes',
              'html',
              'link',
              'multimedia',
              'pubReferences',
              'superscriptions',
              'validRange',
              'verses'
            ],
            type: 'object'
          },
          BibleSuperscription: {
            type: 'object'
          }
        }
      }
    },
    description: 'Get a Bible chapter by book and chapter number.',
    operationId: 'getBibleChapter',
    parameters: [
      { $ref: '#/components/parameters/LangSymbol' },
      { $ref: '#/components/parameters/BibleBook' },
      { $ref: '#/components/parameters/BibleChapter' }
    ],
    responses: {
      200: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/BibleRange' } } },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get Bible chapter.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getChapter({ book, chapter, locale: symbol })
})
