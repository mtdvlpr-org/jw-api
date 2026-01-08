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
          BibleRange: {
            example: {
              chapterOutlines: [
                {
                  content:
                    '<ul><li class="L1">\n\n<p id="p3" data-pid="3">Creation of heavens and earth <span class="altsize">(</span><a class=\' jsBibleLink\' data-bible=\'nwtsty\' data-requested-bible=\'nwtsty\' data-targetverses=\'1001001-1001002\' href=\'/en/library/bible/study-bible/books/genesis/1/#v1001001-v1001002\' target=\'_blank\'><span class="altsize">1, 2</span></a><span class="altsize">)</span></p>\n\n\n\n\n</li><ul>',
                  id: 210572701,
                  source: '1001000-1001999',
                  title: 'Genesis Outline',
                  type: 'outline'
                }
              ],
              citation: 'Genesis&nbsp;1:1-31',
              citationVerseRange: '1:1-31',
              commentaries: [],
              crossReferences: [
                {
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
                }
              ],
              footnotes: [
                {
                  anchor: 'fn210572938',
                  content: '<span class="">Or “empty.”</span>',
                  id: 210572938,
                  source: '1001002'
                }
              ],
              html: '<span class="verse" id="v1001001"><span class="style-b"><span class="chapterNum"><a href=\'/en/library/bible/study-bible/books/json/data/1001001-1001999#v1001001\' data-anchor=\'#v1001001\'>1 </a></span> In the beginning God created the heavens and the earth.<a class="xrefLink jsBibleLink" id="xreflink210572864" href="/en/library/bible/study-bible/books/genesis/1/#v1001001-v1001031" data-bible="nwtsty" data-targetverses="19102025,23042005,23045018,45001020,58001010,66004011,66010006">+</a></span>\r\n<span class="parabreak"></span></span>',
              link: 'https://www.jw.org/en/library/bible/study-bible/books/genesis/1/#v1001001-v1001031',
              multimedia: [],
              pubReferences: [],
              superscriptions: [],
              validRange: '1001001-1001031',
              verses: [
                {
                  abbreviatedCitation: 'Ge&nbsp;1:1',
                  bookNumber: 1,
                  chapterNumber: 1,
                  content:
                    '<span class="style-b"><span class="chapterNum"><a href=\'/en/library/bible/study-bible/books/json/data/1001001-1001999#v1001001\' data-anchor=\'#v1001001\'>1 </a></span> In the beginning God created the heavens and the earth.<xref id="210572864"></xref></span>\r\n<span class="parabreak"></span>',
                  standardCitation: 'Genesis&nbsp;1:1',
                  verseNumber: 1,
                  vsID: '1001001'
                }
              ]
            },
            properties: {
              chapterOutlines: {
                items: {
                  properties: {
                    content: { format: 'html', type: 'string' },
                    id: { type: 'number' },
                    source: { type: 'string' },
                    title: { type: 'string' },
                    type: { type: 'string' }
                  },
                  type: 'object'
                },
                required: ['content', 'id', 'source', 'title', 'type'],
                type: 'array'
              },
              citation: { type: 'string' },
              citationVerseRange: { type: 'string' },
              validRange: { type: 'string' },
              verses: { items: { $ref: '#/components/schemas/BibleVerse' }, type: 'array' }
            },
            required: ['citation', 'citationVerseRange', 'validRange', 'verses'],
            type: 'object'
          }
        }
      }
    },
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
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getChapter({ book, chapter, locale: symbol })
})
