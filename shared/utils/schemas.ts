import { z } from 'zod'

import type { BibleBookNr } from '../types/bible'
import type {
  DurationHHMM,
  DurationMinSec,
  HumanReadableDateTime,
  ISODate,
  ISODateTime,
  ISODateTimeOffset,
  Timestamp
} from '../types/date'
import type { CategoryKey, MediaKey } from '../types/mediator'

/* Helpers */

export const htmlSchema = z.string().brand<'HTML'>().meta({ format: 'html' })

export const isoDateSchema = z.iso.date().meta({
  description: 'An ISO date string.',
  examples: ['2026-01-30', '2024-12-05', '2023-07-15']
}) as unknown as z.ZodCustom<ISODate>

export const isoDateTimeSchema = z.iso.datetime().meta({
  description: 'An ISO date time string.',
  examples: ['2026-01-30T13:32:28.886Z', '2024-12-05T09:15:00.000Z', '2023-07-15T22:45:10.123Z']
}) as unknown as z.ZodCustom<ISODateTime>

export const isoDateTimeOffset = z.iso.datetime({ offset: true }).meta({
  description: 'An ISO date time string with an offset.',
  examples: [
    '2026-01-30T13:32:28.886+00:00',
    '2024-12-05T09:15:00.000-05:00',
    '2023-07-15T22:45:10.123+02:00'
  ]
}) as unknown as z.ZodCustom<ISODateTimeOffset>

export const isoTime = z.iso.time().meta({
  description: 'An ISO time string.',
  examples: ['13:32:28.886', '09:15:00.000', '22:45:10.123']
}) as unknown as z.ZodCustom<Timestamp>

export const humanReadableDateTimeSchema = z
  .custom<HumanReadableDateTime>(
    (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)
  )
  .meta({
    description: 'A human readable date time string.',
    examples: ['2026-01-30 13:32:28', '2024-12-05 09:15:00', '2023-07-15 22:45:10']
  })

export const durationMinSecSchema = z
  .custom<DurationMinSec>((v) => typeof v === 'string' && /^([1-9]h )?\d{1,2}m \d{1,2}s$/.test(v))
  .meta({
    description: 'An abbreviated duration string.',
    examples: ['1h 23m 45s', '23m 45s', '2h 5m 9s']
  })

export const durationHHMMSchema = z
  .custom<DurationHHMM>((v) => typeof v === 'string' && /^([1-9]:)?\d{1,2}:\d{1,2}$/.test(v))
  .meta({
    description: 'A clock duration string.',
    examples: ['1:23:45', '23:45', '2:05:09']
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayStringSchema = <T extends z.ZodType<any, string[]>>(
  schema: T,
  separator = ','
) => {
  return z
    .string()
    .transform((v) => v.split(separator))
    .pipe(schema)
}

export const numericStringSchema = (schema: z.ZodType<number>) => {
  return schema.transform(String) as unknown as z.ZodTemplateLiteral<`${number}`>
}

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

export const imageSizeSchema = z.enum(imageSizes).meta({
  description: 'A JW image size.',
  examples: ['xs', 'md', 'xl']
})

export const imageTypeSchema = z.enum(imageTypes).meta({
  description: 'A JW image type.',
  examples: ['sqr', 'pnr', 'wss']
})

/* General */

export const trackSchema = z.coerce
  .number<number | string>()
  .int()
  .min(0)
  .meta({ description: 'A track number.', examples: [0, 11, 161] })

export const imagesObjectSchema = z.partialRecord(
  imageTypeSchema,
  z.partialRecord(imageSizeSchema, z.httpUrl())
)

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

export const bibleVerseIdSchema = numericStringSchema(
  z.coerce.number<number | string>().int().min(1001000).max(66022021)
).meta({
  description: 'The ID of a Bible verse in BCCCVVV format.',
  examples: ['1001001', '19025012', '40013005']
})

export const bibleRangeIdSchema = z.templateLiteral([z.number(), '-', z.number()]).meta({
  description: 'A range of Bible verse IDs in BCCCVVV-BCCCVVV format.',
  examples: ['1001001-1001010', '19025001-19025012', '40013001-40013005']
})

export const biblePageSchema = z.strictObject({
  abbreviatedTitle: z.string().nonempty(),
  articleCSSClassNames: z.string().nonempty(),
  get children() {
    return z.array(biblePageSchema).optional()
  },
  docClass: numericStringSchema(z.number().int().positive()),
  galleryDisclaimer: z.string().nullish(),
  mepsTitle: z.string().nonempty(),
  openLinksInReadingPane: z.boolean().optional(),
  pageCSSClassNames: z.string().nonempty(),
  pageID: z.string().nonempty(),
  title: z.string().nonempty(),
  type: z.enum(['introduction', 'outline']).optional(),
  url: z.httpUrl()
})

export const bibleBookSchema = z.strictObject({
  additionalPages: z.array(biblePageSchema),
  bookDisplayTitle: z.string().nonempty(),
  chapterCount: numericStringSchema(bibleChapterNrSchema),
  chapterDisplayTitle: z.string().nonempty(),
  hasAudio: z.boolean(),
  hasMultimedia: z.boolean(),
  hasPublicationReferences: z.boolean(),
  hasStudyNotes: z.boolean(),
  images: z.array(
    z.strictObject({
      altText: z.string(),
      caption: z.string().nullable(),
      sizes: z.record(imageSizeSchema, z.httpUrl()),
      type: imageTypeSchema
    })
  ),
  officialAbbreviation: z.string().nonempty(),
  officialPluralAbbreviation: z.string().nonempty(),
  officialSingularAbbreviation: z.string().nonempty(),
  standardAbbreviation: z.string().nonempty(),
  standardName: z.string().nonempty(),
  standardPluralAbbreviation: z.string().nonempty(),
  standardPluralBookName: z.string().nonempty(),
  standardSingularAbbreviation: z.string().nonempty(),
  standardSingularBookName: z.string().nonempty(),
  url: z.string().nonempty(),
  urlSegment: z.string().nonempty()
})

export const bibleBooksSchema = z.record(bibleBookNrSchema, bibleBookSchema)

export const bibleEditionSchema = z.strictObject({
  articleCSSClassNames: z.string().nonempty(),
  bookCount: numericStringSchema(bibleBookNrSchema),
  books: bibleBooksSchema,
  locale: jwLangSymbolSchema,
  pageCSSClassNames: z.string().nonempty(),
  titleFormat: z.string().nonempty(),
  url: z.string().nonempty(),
  vernacularAbbreviation: z.string().nonempty(),
  vernacularFullName: z.string().nonempty(),
  vernacularShortName: z.string().nullable()
})

export const bibleSourceSchema = arrayStringSchema(
  z.union([bibleVerseIdSchema, bibleRangeIdSchema]).array()
)

export const bibleVerseSchema = z.strictObject({
  abbreviatedCitation: htmlSchema.nonempty(),
  bookNumber: bibleBookNrSchema,
  chapterNumber: bibleChapterNrSchema,
  content: htmlSchema.nonempty(),
  standardCitation: htmlSchema.nonempty(),
  verseNumber: bibleVerseNrSchema,
  vsID: bibleVerseIdSchema
})

export const bibleOutlineSchema = z.strictObject({
  content: htmlSchema.nonempty(),
  id: z.number().int().positive(),
  source: bibleRangeIdSchema,
  title: z.string().nonempty(),
  type: z.literal('outline')
})

export const bibleCrossReferenceSchema = z.strictObject({
  id: z.number().int().positive(),
  source: bibleVerseIdSchema,
  targets: z.array(
    z.strictObject({
      abbreviatedCitation: htmlSchema.nonempty(),
      category: z.strictObject({
        id: numericStringSchema(z.number().int().positive()),
        label: z.string().nonempty()
      }),
      standardCitation: htmlSchema.nonempty(),
      vs: z.union([bibleVerseIdSchema, bibleRangeIdSchema])
    })
  )
})

export const bibleFootnoteSchema = z.strictObject({
  anchor: z.templateLiteral(['fn', z.number()]),
  content: htmlSchema.nonempty(),
  id: z.number().int().positive(),
  source: bibleVerseIdSchema
})

export const bibleSuperscriptionSchema = z.strictObject({
  abbreviatedCitation: htmlSchema.nonempty(),
  content: htmlSchema.nonempty(),
  id: z.number().int().positive(),
  source: bibleVerseIdSchema,
  standardCitation: htmlSchema.nonempty()
})

export const biblePubThumbnailSchema = z.strictObject({
  sizes: z.record(imageSizeSchema, z.httpUrl()),
  src: z.httpUrl(),
  zoom: z.httpUrl()
})

export const biblePubReferenceSchema = z.strictObject({
  content: htmlSchema.nonempty(),
  id: z.number().int().positive(),
  source: bibleSourceSchema,
  thumbnail: biblePubThumbnailSchema,
  type: z.literal('video'),
  url: z.httpUrl()
})

export const bibleCommentarySchema = z.strictObject({
  content: htmlSchema.nullable(),
  id: z.number().int().positive(),
  label: htmlSchema.nullable(),
  source: bibleVerseIdSchema.nullable()
})

export const bibleSourceCitationSchema = z.strictObject({
  abbreviatedCitation: htmlSchema.nonempty(),
  link: z.string().nonempty(),
  standardCitation: htmlSchema.nonempty(),
  vs: bibleVerseIdSchema
})

export const bibleResourceSchema = z.strictObject({
  sizes: z.record(imageSizeSchema, z.httpUrl()).optional(),
  src: z.union([
    z.httpUrl(),
    z.array(
      z.union([
        z.httpUrl(),
        z.strictObject({
          docid: numericStringSchema(z.number().int().positive()),
          style: z.literal('chromeless'),
          track: numericStringSchema(trackSchema)
        }),
        z.strictObject({
          pub: z.string().nonempty(),
          style: z.literal('chromeless'),
          track: numericStringSchema(trackSchema)
        })
      ])
    )
  ]),
  zoom: z.httpUrl().optional()
})

export const bibleMultimediaItemSchema = z.strictObject({
  caption: htmlSchema.nullable(),
  docID: z.union([z.literal('-1'), numericStringSchema(z.number().int().positive())]),
  id: z.number().int().positive(),
  keyframe: biblePubThumbnailSchema.nullable(),
  label: htmlSchema.nonempty(),
  pictureCredit: htmlSchema.nullable(),
  source: bibleSourceSchema,
  sourceStandardCitations: z.array(bibleSourceCitationSchema),
  thumbnail: biblePubThumbnailSchema,
  type: z.enum(['image', 'video'])
})

export const bibleRangeSchema = z.strictObject({
  chapterOutlines: z.array(bibleOutlineSchema),
  citation: htmlSchema.nonempty(),
  citationVerseRange: z.string().nonempty(),
  commentary: z.array(bibleCommentarySchema),
  crossReferences: z.array(bibleCrossReferenceSchema),
  footnotes: z.array(bibleFootnoteSchema),
  html: htmlSchema.nonempty(),
  link: z.httpUrl(),
  multimediaItems: z.array(bibleMultimediaItemSchema),
  pubReferences: z.array(biblePubReferenceSchema),
  superscriptions: z.array(bibleSuperscriptionSchema),
  validRange: z.union([bibleVerseIdSchema, bibleRangeIdSchema]),
  verses: z.array(bibleVerseSchema)
})

export const bibleRangesSchema = z.partialRecord(
  z.union([bibleVerseIdSchema, bibleRangeIdSchema]),
  bibleRangeSchema
)

/* JW */

export const jwLanguageSchema = z.strictObject({
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
})

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

export const watchtowerScheduleSchema = z.strictObject({
  w_study_concluding_song: z.number().int().min(1).max(500).optional(),
  w_study_date: isoDateSchema,
  w_study_date_locale: z.string().nonempty().optional(),
  w_study_opening_song: z.number().int().min(1).max(500).optional(),
  w_study_title: z.string().nonempty()
})

export const workbookScheduleSchema = z.strictObject({
  mwb_ayf_count: z.number().int().min(1).max(4),
  mwb_ayf_part1: z.string().nonempty(),
  mwb_ayf_part1_time: z.number().int().min(1).max(15).optional(),
  mwb_ayf_part1_title: z.string().nonempty().optional(),
  mwb_ayf_part1_type: z.string().nonempty().optional(),
  mwb_ayf_part2: z.string().nonempty().optional(),
  mwb_ayf_part2_time: z.number().int().min(1).max(15).optional(),
  mwb_ayf_part2_title: z.string().nonempty().optional(),
  mwb_ayf_part2_type: z.string().nonempty().optional(),
  mwb_ayf_part3: z.string().nonempty().optional(),
  mwb_ayf_part3_time: z.number().int().min(1).max(15).optional(),
  mwb_ayf_part3_title: z.string().nonempty().optional(),
  mwb_ayf_part3_type: z.string().nonempty().optional(),
  mwb_ayf_part4: z.string().nonempty().optional(),
  mwb_ayf_part4_time: z.number().int().min(1).max(15).optional(),
  mwb_ayf_part4_title: z.string().nonempty().optional(),
  mwb_ayf_part4_type: z.string().nonempty().optional(),
  mwb_lc_cbs: z.string().nonempty(),
  mwb_lc_cbs_title: z.string().nonempty().optional(),
  mwb_lc_count: z.number().int().min(1).max(2),
  mwb_lc_part1: z.string().nonempty(),
  mwb_lc_part1_content: z.string().nonempty().optional(),
  mwb_lc_part1_time: z.number().int().min(1).max(15).optional(),
  mwb_lc_part1_title: z.string().nonempty().optional(),
  mwb_lc_part2: z.string().nonempty().optional(),
  mwb_lc_part2_content: z.string().nonempty().optional(),
  mwb_lc_part2_time: z.number().int().min(1).max(15).optional(),
  mwb_lc_part2_title: z.string().nonempty().optional(),
  mwb_song_conclude: z.union([z.number().int().min(1).max(500), z.string().nonempty()]),
  mwb_song_first: z.number().int().min(1).max(500),
  mwb_song_middle: z.union([z.number().int().min(1).max(500), z.string().nonempty()]),
  mwb_tgw_bread: z.string().nonempty(),
  mwb_tgw_bread_title: z.string().nonempty().optional(),
  mwb_tgw_gems_title: z.string().nonempty().optional(),
  mwb_tgw_talk: z.string().nonempty(),
  mwb_tgw_talk_title: z.string().nonempty().optional(),
  mwb_week_date: isoDateSchema,
  mwb_week_date_locale: z.string().nonempty().optional(),
  mwb_weekly_bible_reading: z.string().nonempty()
})

export const meetingScheduleSchema = z.strictObject({
  watchtower: watchtowerScheduleSchema.nullable(),
  workbook: workbookScheduleSchema.nullable()
})

/* PubMedia */

/* WOL */
