import { z } from 'zod'

const querySchema = z.union([pubBibleFetcherSchema, pubDocFetcherSchema, pubFetcherSchema])

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          BookNum: {
            description:
              'A Bible book number representing the book. 0 is used for the whole Bible.',
            examples: {
              0: { summary: 'Whole Bible', value: 0 },
              1: { summary: 'Genesis', value: 1 },
              2: { summary: 'Matthew', value: 40 },
              3: { summary: 'Revelation', value: 66 }
            },
            in: 'query',
            name: 'booknum',
            required: false,
            schema: { maximum: 66, minimum: 0, type: 'integer' },
            summary: 'A Bible book number.'
          },
          DocId: {
            description: 'A document ID. A 9 or 10 digit number used to identify a document.',
            examples: {
              1: { summary: '502013385', value: 502013385 },
              2: { summary: '702012011', value: 702012011 },
              3: { summary: '1112024041', value: 1112024041 }
            },
            in: 'query',
            name: 'docid',
            required: false,
            schema: { minimum: 100000000, type: 'integer' },
            summary: 'A document ID.'
          },
          FileFormat: {
            description: 'An uppercase file format.',
            examples: {
              1: { summary: 'JWPUB', value: 'JWPUB' },
              2: { summary: 'MP3', value: 'MP3' },
              3: { summary: 'MP4', value: 'MP4' }
            },
            in: 'query',
            name: 'fileformat',
            required: false,
            schema: {
              enum: [
                '3GP',
                'AAC',
                'BRL',
                'DAISY',
                'EPUB',
                'JWPUB',
                'M4V',
                'MP3',
                'MP4',
                'PDF',
                'RTF',
                'ZIP'
              ],
              type: 'string'
            },
            summary: 'A file format.'
          },
          Issue: {
            description: 'A six-digit issue number in the format YYYYMM.',
            examples: {
              1: { summary: 'December 2022', value: 202212 },
              2: { summary: 'January 2025', value: 202501 },
              3: { summary: 'March 2025', value: 202503 }
            },
            in: 'query',
            name: 'issue',
            required: false,
            schema: { maximum: 999999, minimum: 100000, type: 'integer' },
            summary: 'An issue number.'
          },
          LangWritten: {
            description: 'A JW language code for internal use.',
            examples: {
              1: { summary: 'English', value: 'E' },
              2: { summary: 'Dutch', value: 'O' },
              3: { summary: 'Spanish', value: 'S' }
            },
            in: 'query',
            name: 'langwritten',
            required: true,
            schema: { type: 'string' },
            summary: 'A JW language code.'
          },
          Pub: {
            description: 'A publication key.',
            examples: {
              1: { summary: 'Watchtower', value: 'w' },
              2: { summary: 'Meeting Workbook', value: 'mwb' },
              3: { summary: 'Study Bible', value: 'nwtsty' }
            },
            in: 'query',
            name: 'pub',
            required: false,
            schema: { type: 'string' },
            summary: 'A publication key.'
          },
          Track: {
            description: 'A track number. 0 is used when there is only one track.',
            examples: {
              1: { summary: 'Track 0 (for the only track)', value: 0 },
              2: { summary: 'Track 1', value: 1 },
              3: { summary: 'Track 2', value: 2 }
            },
            in: 'query',
            name: 'track',
            required: false,
            schema: { minimum: 0, type: 'integer' },
            summary: 'A track number.'
          }
        },
        schemas: {
          Publication: {
            properties: {
              booknum: { nullable: true, type: 'integer' },
              fileformat: { items: { type: 'string' }, type: 'array' },
              files: { additionalProperties: { type: 'object' }, type: 'object' },
              formattedDate: { type: 'string' },
              issue: { type: 'string' },
              languages: { additionalProperties: { type: 'object' }, type: 'object' },
              parentPubName: { type: 'string' },
              pub: { type: 'string' },
              pubImage: {
                properties: {
                  checksum: { type: 'string' },
                  modifiedDatetime: { format: 'date-time', type: 'string' },
                  url: { type: 'string' }
                },
                required: ['checksum', 'modifiedDatetime', 'url'],
                type: 'object'
              },
              pubName: { type: 'string' },
              specialty: { type: 'string' },
              track: { type: ['integer', 'null'] }
            },
            required: [
              'booknum',
              'fileformat',
              'files',
              'formattedDate',
              'issue',
              'languages',
              'parentPubName',
              'pub',
              'pubImage',
              'pubName',
              'specialty',
              'track'
            ],
            type: 'object'
          }
        }
      }
    },
    description:
      'Get a publication by publication key, book number, document ID, issue, track, and file format.',
    operationId: 'getPublication',
    parameters: [
      { $ref: '#/components/parameters/LangWritten' },
      { $ref: '#/components/parameters/Pub' },
      { $ref: '#/components/parameters/BookNum' },
      { $ref: '#/components/parameters/DocId' },
      { $ref: '#/components/parameters/Issue' },
      { $ref: '#/components/parameters/Track' },
      { $ref: '#/components/parameters/FileFormat' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { $ref: '#/components/schemas/Publication' },
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
    summary: 'Get publication.',
    tags: ['Publication', 'Media']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const publication = parseQuery(event, querySchema)

  const result = await pubMediaService.getPublication(publication)
  return apiSuccess(result)
})
