/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NitroRouteMeta } from 'nitropack/types'

import { z, ZodOptional } from 'zod'
import { createSchema } from 'zod-openapi'

/* Dates */

export const weekSchema = z.coerce
  .number<number | string>()
  .int()
  .min(1)
  .max(53)
  .meta({ description: 'An ISO week number.', examples: [1, 52, 53] })

export const monthSchema = z.coerce
  .number<number | string>()
  .int()
  .min(1)
  .max(12)
  .meta({ description: 'A month number.', examples: [1, 5, 12] })

export const yearSchema = z.coerce
  .number<number | string>()
  .int()
  .positive()
  .meta({ description: 'A year number.', examples: [new Date().getFullYear()] })

/* PubMedia */

export const pubFetcherSchema = z.object({
  fileformat: publicationFileFormatSchema.optional(),
  issue: z.coerce
    .number<number | string>()
    .int()
    .positive()
    .optional()
    .meta({
      description: 'An issue number, usually in format YYYYMM or YYYYMMDD.',
      examples: [201705, 20250115, 202012]
    }),
  langwritten: jwLangCodeSchema,
  pub: z
    .string()
    .nonempty()
    .meta({ description: 'A publication key.', examples: ['jwb', 'mwb', 'w'] }),
  track: trackSchema.optional()
})

export const pubDocFetcherSchema = z.object({
  docid: z.coerce
    .number<number | string>()
    .int()
    .positive()
    .meta({
      description: 'A document ID, usually a 9 or 10 digit number.',
      examples: [1112024041, 502013189, 702018118]
    }),
  fileformat: publicationFileFormatSchema.optional(),
  langwritten: jwLangCodeSchema,
  track: trackSchema.optional()
})

export const pubBibleFetcherSchema = z.object({
  booknum: z.coerce
    .number<number | string>()
    .int()
    .min(0)
    .max(66)
    .meta({
      description: 'A bible book number. 0 is used for the whole Bible.',
      examples: [0, 40, 66]
    }) as unknown as z.ZodCustom<0 | BibleBookNr>,
  fileformat: publicationFileFormatSchema.optional(),
  langwritten: jwLangCodeSchema,
  pub: biblePublicationSchema,
  track: trackSchema.optional()
})

/* OpenAPI helpers */

export const zodToParams = (
  zodObject: z.ZodObject<any, any>,
  type: 'cookie' | 'header' | 'path' | 'query'
): NonNullable<Required<NitroRouteMeta>['openAPI']['parameters']> => {
  return Object.entries(zodObject.shape).map(([name, zodSchema]) => {
    const { description, examples, ...schema } = createSchema(zodSchema as any, { io: 'input' })
      .schema as any

    const exampleObject: Record<string, { description?: string; summary?: string; value: string }> =
      {}

    examples?.forEach(
      (example: string | { description?: string; summary?: string; value: string }) => {
        if (typeof example === 'string') {
          exampleObject[example] = { value: example }
        } else if (typeof example === 'object' && 'value' in example) {
          exampleObject[example.value] = {
            description: example.description,
            summary: example.summary,
            value: example.value
          }
        }
      }
    )

    return {
      description,
      examples: exampleObject,
      in: type,
      name,
      required: !(zodSchema instanceof ZodOptional),
      schema
    }
  })
}

export const zodToRequestBody = (
  schema: z.ZodObject<any, any>
): NonNullable<Required<NitroRouteMeta>['openAPI']['requestBody']> => {
  return {
    content: {
      'application/json': { schema: createSchema(schema, { io: 'input' }).schema as any }
    }
  }
}

export const zodToResponses = (
  schema: z.ZodObject<any, any>
): NonNullable<Required<NitroRouteMeta>['openAPI']['responses']> => {
  return {
    '200': {
      content: {
        'application/json': { schema: createSchema(schema, { io: 'output' }).schema as any }
      },
      description: 'Successful response.'
    }
  }
}
