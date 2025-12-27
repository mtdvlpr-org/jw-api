import type { JwLangSymbol } from './lang'
import type { ImageType } from './media'

/* eslint-disable perfectionist/sort-interfaces */
export interface BibleBook {
  chapterCount: `${number}`
  standardName: string
  standardAbbreviation: string
  officialAbbreviation: string
  standardSingularBookName: string
  standardSingularAbbreviation: string
  officialSingularAbbreviation: string
  standardPluralBookName: string
  standardPluralAbbreviation: string
  officialPluralAbbreviation: string
  bookDisplayTitle: string
  chapterDisplayTitle: string
  urlSegment: string
  url: string
  hasAudio: boolean
  hasMultimedia: boolean
  hasStudyNotes: boolean
  hasPublicationReferences: boolean
  additionalPages: unknown[]
  images: {
    altText: string
    caption: null | string
    sizes: Partial<Record<ImageSize, string>>
    type: ImageType
  }
}
/* eslint-enable perfectionist/sort-interfaces */

export type BibleBookNr =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66

export interface BibleChapterOutline {
  content: string
  id: number
  source: string
  title: string
  type: string
}

export interface BibleCrossReference {
  id: number
  source: VerseId
  targets: {
    abbreviatedCitation: string
    category: { id: `${number}`; label: string }
    standardCitation: string
    vs: VerseId
  }[]
}

export interface BibleFootnote {
  anchor: string
  content: string
  id: number
  source: `${number}`
}

/* eslint-disable perfectionist/sort-interfaces */
export interface BibleRange {
  citation: string
  link: string
  validRange: `${BibleBookNr}${number}-${BibleBookNr}${number}`
  citationVerseRange: `${number}:${number}-${number}:${number}` | `${number}:${number}-${number}`
  verses: BibleVerse[]
  chapterOutlines: BibleChapterOutline[]
  crossReferences: BibleCrossReference[]
  footnotes: BibleFootnote[]
  superscriptions: unknown[]
  commentaries: unknown[]
  multimedia: unknown[]
  pubReferences: unknown[]
  html: string
}
/* eslint-enable perfectionist/sort-interfaces */

export interface BibleRangeSingle extends BibleRange {
  citationVerseRange: `${number}:${number}`
}

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface BibleResult {
  additionalPages: unknown[]
  currentLocale: JwLangSymbol
  ranges: Partial<Record<`${BibleBookNr}${number}-${BibleBookNr}${number}`, BibleRange>>
  status: number
  editionData: {
    locale: JwLangSymbol
    bookCount: `${number}`
    vernacularFullName: string
    vernacularShortName: null | string
    vernacularAbbreviation: string
    url: string
    titleFormat: string
    books: Record<BibleBookNr, BibleBook>
  }
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */

export interface BibleResultEmpty extends BibleResult {
  copyrightPage: unknown
  ranges: []
}

export interface BibleResultSingle extends BibleRange {
  ranges: Partial<Record<VerseId, BibleRangeSingle>>
}

/* eslint-disable perfectionist/sort-interfaces */
export interface BibleVerse {
  vsID: VerseId
  bookNumber: BibleBookNr
  chapterNumber: number
  verseNumber: number
  standardCitation: string
  abbreviatedCitation: string
  content: string
}
/* eslint-enable perfectionist/sort-interfaces */

export type VerseId = `${BibleBookNr}${number}`
