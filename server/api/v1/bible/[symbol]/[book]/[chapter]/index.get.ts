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
            example: {
              content:
                "<p id=\"p4\" data-pid=\"4\" class=\"s5\"><strong>Matthew:</strong> The Greek name rendered “Matthew” is probably a shortened form of the Hebrew name rendered “Mattithiah” (<a class='b jsBibleLink' data-bible='nwtsty' data-requested-bible='' data-targetverses='13015018' href='/en/library/bible/study-bible/books/1-chronicles/15/#v13015018' target='_blank'>1Ch 15:18</a>), meaning “Gift of Jehovah.”</p>\r\n<p id=\"p5\" data-pid=\"5\" class=\"s5\"><strong>According to Matthew:</strong> None of the <a class='jsDialogContentLink pub-nwtstg' data-title='Glossary' data-page-id=\"mid1001077366\" href='/en/library/books/bible-glossary/gospel/'>Gospel</a> writers identify themselves as such in their accounts, and titles were evidently not part of the original text. In some <a class='jsDialogContentLink pub-nwtstg' data-title='Glossary' data-page-id=\"mid1001077377\" href='/en/library/books/bible-glossary/manuscripts/'>manuscripts</a> of Matthew’s Gospel, the title appears as <em>Eu·ag·geʹli·on Ka·taʹ Math·thaiʹon</em> (“Good News [or, “Gospel”] According to Matthew”), whereas in others a shorter title, <em>Ka·taʹ Math·thaiʹon</em> (“According to Matthew”), is used. It is not clear exactly when such titles were added or began to be used. Some suggest that it was in the second century C.E., since examples of the longer title have been found in Gospel manuscripts that have been dated to the end of the second century or early third century. According to some scholars, the opening words of Mark’s book (“The beginning of the good news about Jesus Christ, the Son of God”) may have been the reason why the term “gospel” (lit., “good news”) came to be used to describe these accounts. The use of such titles along with the name of the writer may have come about for practical reasons, providing a clear means of identification of the books.</p>\r\n",
              id: 210610012,
              label: '<strong>Title</strong>\n',
              source: '40001000'
            },
            properties: {
              content: { format: 'html', type: ['string', 'null'] },
              id: { type: 'integer' },
              label: { format: 'html', type: ['string', 'null'] },
              source: { type: ['string', 'null'] }
            },
            required: ['id', 'source', 'content', 'label'],
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
            properties: {
              caption: { format: 'html', type: ['string', 'null'] },
              docID: { type: 'string' },
              id: { type: 'integer' },
              keyframe: { $ref: '#/components/schemas/BibleMultiMediaResource' },
              label: { format: 'html', type: 'string' },
              pictureCredit: { format: 'html', type: ['string', 'null'] },
              resource: {
                $ref: '#/components/schemas/BibleMultiMediaResource'
              },
              source: { type: 'string' },
              sourceStandardCitations: {
                properties: {
                  abbreviatedCitation: { format: 'html', type: 'string' },
                  link: { type: 'string' },
                  standardCitation: { format: 'html', type: 'string' },
                  vs: { type: 'string' }
                },
                required: ['vs', 'standardCitation', 'link', 'abbreviatedCitation'],
                type: 'object'
              },
              thumbnail: {
                $ref: '#/components/schemas/BibleMultiMediaResource'
              },
              type: { enum: ['image', 'video'], type: 'string' }
            },
            required: [
              'docID',
              'id',
              'keyframe',
              'label',
              'resource',
              'source',
              'type',
              'caption',
              'pictureCredit',
              'sourceStandardCitations',
              'thumbnail'
            ],
            type: 'object'
          },
          BibleMultiMediaResource: {
            properties: {
              sizes: { $ref: '#/components/schemas/ImageSizesObject' },
              src: {
                oneOf: [
                  { format: 'uri', type: 'string' },
                  {
                    items: {
                      oneOf: [
                        { format: 'uri', type: 'string' },
                        {
                          properties: {
                            pub: { type: 'string' },
                            style: { type: 'string' },
                            track: { type: 'string' }
                          },
                          required: ['pub', 'style', 'track'],
                          type: 'object'
                        }
                      ],
                      type: ['string', 'object']
                    },
                    minItems: 1,
                    type: 'array'
                  }
                ],
                type: ['string', 'object']
              },
              zoom: { format: 'uri', type: 'string' }
            },
            required: ['src'],
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
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { $ref: '#/components/schemas/BibleRange' },
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
    summary: 'Get Bible chapter.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol } = parseRouteParams(event, routeSchema)

  const result = await bibleService.getChapter({ book, chapter, locale: symbol })
  return apiSuccess(result)
})
