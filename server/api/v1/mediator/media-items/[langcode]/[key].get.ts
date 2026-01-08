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
          MediaItem: {
            example: {
              availableLanguages: ['E'],
              description: 'Description',
              duration: 100,
              durationFormattedHHMM: '1:40',
              durationFormattedMinSec: '1:40',
              files: [],
              firstPublished: '2020-01-01T00:00:00.000Z',
              guid: 'GUID',
              images: {},
              languageAgnosticNaturalKey: 'pub-ivno_x_VIDEO',
              naturalKey: 'pub-ivno_E_x_VIDEO',
              primaryCategory: 'VideoOnDemand',
              printReferences: [],
              tags: [],
              title: 'Title',
              type: 'video'
            },
            properties: {
              availableLanguages: { items: { type: 'string' }, type: 'array' },
              description: { type: 'string' },
              duration: { type: 'number' },
              durationFormattedHHMM: { type: 'string' },
              durationFormattedMinSec: { type: 'string' },
              files: { items: { type: 'object' }, type: 'array' },
              firstPublished: { format: 'date-time', type: 'string' },
              guid: { type: 'string' },
              images: { additionalProperties: { type: 'object' }, type: 'object' },
              languageAgnosticNaturalKey: { type: 'string' },
              naturalKey: { type: 'string' },
              primaryCategory: { type: 'string' },
              printReferences: { items: { type: 'string' }, type: 'array' },
              tags: { items: { type: 'object' }, type: 'array' },
              title: { type: 'string' },
              type: { type: 'string' }
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
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MediaItem' }
          }
        },
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
