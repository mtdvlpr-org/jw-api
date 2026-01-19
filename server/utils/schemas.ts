/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NitroRouteMeta } from 'nitropack/types'

import { z, ZodOptional } from 'zod'
import { createSchema } from 'zod-openapi'

/* Enums */

export const jwLangSymbolSchema = z
  .enum(jwLangSymbols)
  .meta({ description: 'A JW language symbol.', examples: ['en', 'es', 'nl'] })

export const jwLangCodeSchema = z
  .enum(jwLangCodes)
  .meta({ description: 'A JW language code.', examples: ['E', 'S', 'O'] })

export const jwLangScriptSchema = z
  .enum(jwLangScripts)
  .meta({ description: 'A JW language script.', examples: ['ROMAN', 'CYRILLIC', 'ARABIC'] })

export const publicationFileFormatSchema = z
  .enum(publicationFileFormats)
  .meta({ description: 'A publication file format.', examples: ['MP3', 'MP4', 'JWPUB'] })

export const biblePublicationSchema = z.enum(biblePublications).meta({
  description: 'A Bible publication key.',
  examples: ['nwt', 'nwtsty', 'bi12']
})

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

/* Bible */

export const bibleBookNrSchema = z.coerce
  .number<number | string>()
  .int()
  .min(1)
  .max(66)
  .meta({
    description: 'A Bible book number.',
    examples: [1, 40, 66]
  }) as unknown as z.ZodCustom<BibleBookNr>

export const bibleChapterNrSchema = z.coerce
  .number<number | string>()
  .int()
  .min(1)
  .max(150)
  .meta({ description: 'A Bible book chapter number.', examples: [1, 10, 150] })

export const bibleVerseNrSchema = z.coerce
  .number<number | string>()
  .int()
  .min(1)
  .max(176)
  .meta({ description: 'A Bible book verse number.', examples: [1, 10, 176] })

/* JW */
export const jwLanguageSchema = {
  altSpellings: z
    .array(z.string().nonempty())
    .min(1)
    .meta({ description: 'The alternative spellings of a language.' }),
  direction: z.enum(['ltr', 'rtl']).meta({ description: 'The direction of a language.' }),
  hasWebContent: z.boolean().meta({ description: 'Whether a language has web content.' }),
  isCounted: z.boolean().meta({ description: 'Whether a language is counted.' }),
  isSignLanguage: z.boolean().meta({ description: 'Whether a language is a sign language.' }),
  langcode: jwLangCodeSchema,
  name: z
    .string()
    .nonempty()
    .meta({
      description: 'The name of a language.',
      examples: ['English', 'Dutch', 'Spanish']
    }),
  script: jwLangScriptSchema,
  symbol: jwLangSymbolSchema,
  vernacularName: z
    .string()
    .nonempty()
    .meta({
      description: 'The vernacular name of a language.',
      examples: ['English', 'Nederlands', 'Español']
    })
}

/* Mediator */

export const categoryKeySchema = z
  .string() // Allow unknown category keys
  .nonempty()
  .meta({
    description: 'A category key.',
    examples: [...categoryContainerKeys, ...categoryOnDemandKeys]
  }) as unknown as z.ZodCustom<CategoryKey>

export const mediaKeySchema = z
  .custom<MediaKey>((v) => typeof v === 'string' && isMediaKey(v))
  .meta({
    description: 'The language agnostic natural key of a media item.',
    examples: [
      'pub-ivno_x_VIDEO',
      'pub-mwbv_202405_1_VIDEO',
      'pub-jwb-092_5_VIDEO',
      'pub-osg_9_AUDIO',
      'docid-1112024040_1_VIDEO',
      'docid-1112024039_114_VIDEO'
    ]
  })

/* Meetings */

/* PubMedia */

const track = z.coerce
  .number<number | string>()
  .int()
  .min(0)
  .optional()
  .meta({ description: 'A track number.', examples: [0, 11, 161] })

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
  track
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
  track
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
  track
})

/* WOL */

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
