import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          BibleAdditionalPage: {
            example: {
              abbreviatedTitle: 'Introduction to Genesis',
              articleCSSClassNames:
                'jwac docClass-113 docId-1001070005 ms-ROMAN ml-E dir-ltr pub-nwtsty',
              docClass: '113',
              mepsTitle: 'Introduction to Genesis',
              pageCSSClassNames:
                'publications pub-nwtsty dir-ltr ml-E ms-ROMAN docId-1001070005 docClass-113 StudyBible',
              pageID: 'mid1001070005',
              title: 'Introduction to Genesis',
              type: 'introduction',
              url: 'https://www.jw.org/en/library/bible/study-bible/books/genesis-introduction/'
            },
            properties: {
              abbreviatedTitle: { type: 'string' },
              articleCSSClassNames: { type: 'string' },
              children: {
                items: { $ref: '#/components/schemas/BibleAdditionalPage' },
                type: 'array'
              },
              docClass: { type: 'string' },
              galleryDisclaimer: { type: 'string' },
              mepsTitle: { type: 'string' },
              openLinksInReadingPane: { type: 'boolean' },
              pageCSSClassNames: { type: 'string' },
              pageID: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              url: { format: 'uri', type: 'string' }
            },
            required: [
              'abbreviatedTitle',
              'articleCSSClassNames',
              'docClass',
              'mepsTitle',
              'pageCSSClassNames',
              'pageID',
              'title',
              'url'
            ],
            type: 'object'
          },
          BibleBook: {
            properties: {
              additionalPages: {
                items: { $ref: '#/components/schemas/BibleAdditionalPage' },
                type: 'array'
              },
              bookDisplayTitle: { type: 'string' },
              chapterCount: { type: 'string' },
              chapterDisplayTitle: { type: 'string' },
              hasAudio: { type: 'boolean' },
              hasMultimedia: { type: 'boolean' },
              hasPublicationReferences: { type: 'boolean' },
              hasStudyNotes: { type: 'boolean' },
              images: {
                items: {
                  properties: {
                    altText: { type: 'string' },
                    caption: { type: ['string', 'null'] },
                    sizes: {
                      properties: {
                        lg: { format: 'uri', type: 'string' },
                        md: { format: 'uri', type: 'string' },
                        sm: { format: 'uri', type: 'string' },
                        xl: { format: 'uri', type: 'string' },
                        xs: { format: 'uri', type: 'string' }
                      },
                      required: ['lg', 'md', 'sm', 'xl', 'xs'],
                      type: 'object'
                    },
                    type: { type: 'string' }
                  },
                  required: ['altText', 'caption', 'sizes', 'type'],
                  type: 'object'
                },
                type: 'array'
              },
              officialAbbreviation: { type: 'string' },
              officialPluralAbbreviation: { type: 'string' },
              officialSingularAbbreviation: { type: 'string' },
              standardAbbreviation: { type: 'string' },
              standardName: { type: 'string' },
              standardPluralAbbreviation: { type: 'string' },
              standardPluralBookName: { type: 'string' },
              standardSingularAbbreviation: { type: 'string' },
              standardSingularBookName: { type: 'string' },
              url: { type: 'string' },
              urlSegment: { type: 'string' }
            },
            required: [
              'additionalPages',
              'bookDisplayTitle',
              'chapterCount',
              'chapterDisplayTitle',
              'hasAudio',
              'hasMultimedia',
              'hasPublicationReferences',
              'hasStudyNotes',
              'images',
              'officialAbbreviation',
              'officialPluralAbbreviation',
              'officialSingularAbbreviation',
              'standardAbbreviation',
              'standardName',
              'standardPluralAbbreviation',
              'standardPluralBookName',
              'standardSingularAbbreviation',
              'standardSingularBookName',
              'url',
              'urlSegment'
            ],
            type: 'object'
          },
          BibleBooks: {
            additionalProperties: { $ref: '#/components/schemas/BibleBook' },
            example: {
              '1': {
                additionalPages: [
                  {
                    abbreviatedTitle: 'Introduction to Genesis',
                    articleCSSClassNames:
                      'jwac docClass-113 docId-1001070005 ms-ROMAN ml-E dir-ltr pub-nwtsty',
                    docClass: '113',
                    mepsTitle: 'Introduction to Genesis',
                    pageCSSClassNames:
                      'publications pub-nwtsty dir-ltr ml-E ms-ROMAN docId-1001070005 docClass-113 StudyBible',
                    pageID: 'mid1001070005',
                    title: 'Introduction to Genesis',
                    type: 'introduction',
                    url: 'https://www.jw.org/en/library/bible/study-bible/books/genesis-introduction/'
                  }
                ],
                bookDisplayTitle: 'The Book of Genesis',
                chapterCount: '50',
                chapterDisplayTitle: 'Genesis',
                hasAudio: true,
                hasMultimedia: false,
                hasPublicationReferences: false,
                hasStudyNotes: false,
                images: [
                  {
                    altText: 'The New World Translation of the Holy Scriptures (Study Edition)',
                    caption: null,
                    sizes: {
                      lg: 'https://cms-imgp.jw-cdn.org/img/p/1001070000/univ/art/1001070000_univ_sqr_lg.jpg',
                      md: 'https://cms-imgp.jw-cdn.org/img/p/1001070000/univ/art/1001070000_univ_sqr_md.jpg',
                      sm: 'https://cms-imgp.jw-cdn.org/img/p/1001070000/univ/art/1001070000_univ_sqr_sm.jpg',
                      xl: 'https://cms-imgp.jw-cdn.org/img/p/1001070000/univ/art/1001070000_univ_sqr_xl.jpg',
                      xs: 'https://cms-imgp.jw-cdn.org/img/p/1001070000/univ/art/1001070000_univ_sqr_xs.jpg'
                    },
                    type: 'sqr'
                  }
                ],
                officialAbbreviation: 'Ge',
                officialPluralAbbreviation: 'Ge',
                officialSingularAbbreviation: 'Ge',
                standardAbbreviation: 'Gen.',
                standardName: 'Genesis',
                standardPluralAbbreviation: 'Gen.',
                standardPluralBookName: 'Genesis',
                standardSingularAbbreviation: 'Gen.',
                standardSingularBookName: 'Genesis',
                url: '/en/library/bible/study-bible/books/genesis/',
                urlSegment: 'genesis'
              }
            },
            type: 'object'
          }
        }
      }
    },
    description: 'Get all Bible books for a given language.',
    operationId: 'getBibleBooks',
    parameters: [{ $ref: '#/components/parameters/LangSymbol' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { $ref: '#/components/schemas/BibleBooks' },
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
    summary: 'Get Bible books.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { symbol } = parseRouteParams(event, routeSchema)

  const result = await bibleService.getBooks(symbol)
  return apiSuccess(result)
})
