import { z } from 'zod'

const routeSchema = z.object({ key: categoryKeySchema, langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          CategoryKey: {
            description: 'A category key representing the category.',
            examples: {
              1: { summary: 'Videos', value: 'VideoOnDemand' },
              2: { summary: 'Music', value: 'Audio' },
              3: { summary: 'Studio', value: 'VODStudio' }
            },
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string' },
            summary: 'A category key.'
          }
        },
        schemas: {
          CategoryOndemand: {
            properties: {
              description: { type: 'string' },
              images: { $ref: '#/components/schemas/ImagesObject' },
              key: { type: 'string' },
              media: { items: { $ref: '#/components/schemas/MediaItem' }, type: 'array' },
              name: { type: 'string' },
              parentCategory: {
                oneOf: [{ $ref: '#/components/schemas/CategoryParent' }, { type: 'null' }],
                type: ['object', 'null']
              },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { enum: ['ondemand'], type: 'string' }
            },
            required: [
              'description',
              'media',
              'parentCategory',
              'images',
              'key',
              'name',
              'tags',
              'type'
            ],
            type: 'object'
          }
        }
      }
    },
    description: 'Get a category by key.',
    operationId: 'getCategory',
    parameters: [
      { $ref: '#/components/parameters/LangCode' },
      { $ref: '#/components/parameters/CategoryKey' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: {
                  oneOf: [
                    { $ref: '#/components/schemas/CategoryOndemand' },
                    { $ref: '#/components/schemas/CategoryContainer' }
                  ],
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
    summary: 'Get category.',
    tags: ['Mediator', 'Categories']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: locale } = parseRouteParams(event, routeSchema)

  const result = await mediatorService.getCategory(key, { locale })
  return apiSuccess(result)
})
