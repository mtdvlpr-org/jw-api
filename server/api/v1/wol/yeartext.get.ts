import { z } from 'zod'

const currentYear = new Date().getFullYear()

const querySchema = z.object({
  wtlocale: jwLangCodeSchema,
  year: yearSchema
    .min(currentYear - 1)
    .max(currentYear + 1)
    .optional()
    .meta({ description: 'The year of the yeartext.', examples: [currentYear] })
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          WtLocale: {
            description: 'A JW language code for internal use.',
            examples: {
              1: { summary: 'English', value: 'E' },
              2: { summary: 'Dutch', value: 'O' },
              3: { summary: 'Spanish', value: 'S' }
            },
            in: 'query',
            name: 'wtlocale',
            required: true,
            schema: { type: 'string' }
          }
        }
      }
    },
    description: 'Get the yeartext for a given language and year.',
    operationId: 'getYeartext',
    parameters: [
      { $ref: '#/components/parameters/WtLocale' },
      {
        description: 'The year of the yeartext.',
        example: 2026,
        in: 'query',
        name: 'year',
        required: false,
        schema: { default: 2026, maximum: 2027, minimum: 2025, type: 'integer' }
      }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            example: {
              data: { yeartext: { '2026': 'The yeartext of 2026.' } },
              meta: {
                requestId: 'k7f2m9x3q1',
                responseTime: 42,
                timestamp: '2026-01-09T12:34:56.789Z',
                version: 'v1'
              },
              success: true
            },
            schema: {
              properties: {
                data: {
                  properties: {
                    yeartext: { additionalProperties: { type: 'string' }, type: 'object' }
                  },
                  required: ['yeartext'],
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
    summary: 'Get yeartext.',
    tags: ['WOL']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { wtlocale, year } = parseQuery(event, querySchema)

  const { parsedTitle, year: usedYear } = await wolService.getYeartextDetails(wtlocale, year)

  return apiSuccess({ yeartext: { [usedYear.toString()]: parsedTitle } })
})
