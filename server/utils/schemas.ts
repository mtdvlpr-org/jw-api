/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NitroRouteMeta } from 'nitropack/types'

import { z, ZodOptional } from 'zod'
import { createSchema } from 'zod-openapi'

// Enums
export const jwLangSymbolSchema = z
  .enum(jwLangSymbols)
  .describe('A JW language symbol.')
  .meta({ example: 'en' })

export const jwLangCodeSchema = z
  .enum(jwLangCodes)
  .describe('A JW language code.')
  .meta({ example: 'E' })

export const publicationFileFormatSchema = z
  .enum(publicationFileFormats)
  .describe('A publication file format.')
  .meta({ example: 'MP4' })

export const bibleBookNrSchema = (
  type: 'coerced' | 'number' = 'coerced',
  description?: string
): z.ZodCustom<BibleBookNr> =>
  (type === 'coerced' ? z.coerce.number<string>() : z.number())
    .int()
    .min(1)
    .max(66)
    .meta({ example: 1 })
    .describe(description || 'A Bible book number.') as unknown as z.ZodCustom<BibleBookNr>

export const bibleChapterNrSchema = (
  type: 'coerced' | 'number' = 'coerced',
  description?: string
) =>
  (type === 'coerced' ? z.coerce.number<string>() : z.number())
    .int()
    .min(1)
    .max(150)
    .meta({ example: 1 })
    .describe(description || 'A Bible book chapter number.')

export const bibleVerseNrSchema = (type: 'coerced' | 'number' = 'coerced', description?: string) =>
  (type === 'coerced' ? z.coerce.number<string>() : z.number())
    .int()
    .min(1)
    .max(176)
    .meta({ example: 1 })
    .describe(description || 'A Bible book verse number.')

export const zodToParams = (
  zodObject: z.ZodObject<any, any>,
  type: 'cookie' | 'header' | 'path' | 'query'
): NonNullable<Required<NitroRouteMeta>['openAPI']['parameters']> => {
  return Object.entries(zodObject.shape).map(([name, zodSchema]) => {
    const { description, example, ...schema } = createSchema(zodSchema as any, { io: 'input' })
      .schema as any
    return {
      description,
      example,
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
      description: 'Successful response'
    }
  }
}
