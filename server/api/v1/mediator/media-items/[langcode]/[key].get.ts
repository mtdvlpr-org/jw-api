import { z } from 'zod'

const routeSchema = z.object({ key: mediaKeySchema, langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          MediaKey: {
            description: 'The media key.',
            examples: {
              1: { summary: 'Video 1', value: 'pub-ivno_x_VIDEO' },
              2: { summary: 'Video 2', value: 'pub-mwbv_202405_1_VIDEO' },
              3: { summary: 'Audio 1', value: 'pub-osg_9_AUDIO' }
            },
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string' }
          }
        },
        schemas: {
          ImagesObject: {
            properties: {
              cvr: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              lsr: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              lss: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xl: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              pnr: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              sqr: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              sqs: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              wsr: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              },
              wss: {
                properties: {
                  lg: { format: 'uri', type: 'string' },
                  md: { format: 'uri', type: 'string' },
                  sm: { format: 'uri', type: 'string' },
                  xs: { format: 'uri', type: 'string' }
                },
                type: 'object'
              }
            },
            type: 'object'
          },
          MediaItem: {
            properties: {
              availableLanguages: { items: { type: 'string' }, type: 'array' },
              description: { type: 'string' },
              duration: { type: 'number' },
              durationFormattedHHMM: { type: 'string' },
              durationFormattedMinSec: { type: 'string' },
              files: { items: { $ref: '#/components/schemas/MediaItemFile' }, type: 'array' },
              firstPublished: { format: 'date-time', type: 'string' },
              guid: { type: 'string' },
              images: { $ref: '#/components/schemas/ImagesObject' },
              languageAgnosticNaturalKey: { type: 'string' },
              naturalKey: { type: 'string' },
              primaryCategory: { type: 'string' },
              printReferences: { items: { type: 'string' }, type: 'array' },
              tags: { items: { type: 'string' }, type: 'array' },
              title: { type: 'string' },
              type: { enum: ['video', 'audio'], type: 'string' }
            },
            required: [
              'availableLanguages',
              'description',
              'duration',
              'durationFormattedHHMM',
              'durationFormattedMinSec',
              'files',
              'firstPublished',
              'guid',
              'images',
              'languageAgnosticNaturalKey',
              'naturalKey',
              'primaryCategory',
              'printReferences',
              'tags',
              'title',
              'type'
            ],
            type: 'object'
          },
          MediaItemFile: {
            properties: {
              checksum: { type: 'string' },
              filesize: { type: 'integer' },
              label: { type: 'string' },
              mimetype: { type: 'string' },
              modifiedDateTime: { format: 'date-time', type: 'string' },
              progressiveDownloadURL: { format: 'uri', type: 'string' },
              subtitled: { type: 'boolean' },
              subtitles: {
                properties: {
                  checksum: { type: 'string' },
                  modifiedDateTime: { format: 'date-time', type: 'string' },
                  url: { format: 'uri', type: 'string' }
                },
                required: ['checksum', 'modifiedDateTime', 'url'],
                type: 'object'
              }
            },
            required: [
              'checksum',
              'filesize',
              'label',
              'mimetype',
              'modifiedDateTime',
              'progressiveDownloadURL',
              'subtitled'
            ],
            type: 'object'
          }
        }
      }
    },
    parameters: [
      { $ref: '#/components/parameters/LangCode' },
      { $ref: '#/components/parameters/MediaKey' }
    ],
    responses: {
      200: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/MediaItem' } } },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Mediator', 'Media']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: langwritten } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getMediaItem({ key, langwritten })
})
