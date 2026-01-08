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
          Category: {
            example: {
              description: 'Videos on demand',
              images: {},
              key: 'VideoOnDemand',
              name: 'Videos',
              parentCategory: null,
              tags: [],
              type: 'container'
            },
            properties: {
              description: { type: 'string' },
              images: { additionalProperties: { type: 'object' }, type: 'object' },
              key: { type: 'string' },
              name: { type: 'string' },
              parentCategory: { nullable: true, type: 'object' },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { type: 'string' }
            },
            required: ['description', 'images', 'key', 'name', 'parentCategory', 'tags', 'type'],
            type: 'object'
          }
        }
      }
    },
    parameters: [
      { $ref: '#/components/parameters/LangCode' },
      { $ref: '#/components/parameters/CategoryKey' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Category' }
          }
        },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Mediator', 'Categories']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: locale } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getCategory(key, { locale })
})
