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

export interface BibleChapterOutline {
  content: string
  id: number
  source: string
  title: string
  type: string
}

export interface BibleCrossReference {
  id: number
  source: `${number}`
  targets: {
    abbreviatedCitation: string
    category: { id: `${number}`; label: string }
    standardCitation: string
    vs: `${number}`
  }[]
}

export interface BibleFootnote {
  anchor: string
  content: string
  id: number
  source: `${number}`
}

export interface BibleRange {
  chapterOutlines: BibleChapterOutline[]
  citation: string
  citationVerseRange: `${number}:${number}-${number}:${number}` | `${number}:${number}-${number}`
  commentaries: unknown[]
  crossReferences: BibleCrossReference[]
  footnotes: BibleFootnote[]
  html: string
  link: string
  multimedia: unknown[]
  pubReferences: unknown[]
  superscriptions: unknown[]
  validRange: `${`${number}`}-${`${number}`}`
  verses: BibleVerse[]
}

export interface BibleRangeSingle extends Omit<BibleRange, 'citationVerseRange'> {
  citationVerseRange: `${number}:${number}`
}

export interface BibleResult {
  additionalPages: unknown[]
  currentLocale: JwLangSymbol
  editionData: {
    bookCount: `${number}`
    books: Record<number, BibleBook>
    locale: JwLangSymbol
    titleFormat: string
    url: string
    vernacularAbbreviation: string
    vernacularFullName: string
    vernacularShortName: null | string
  }
  ranges: Partial<Record<`${`${number}`}-${`${number}`}`, BibleRange>>
  status: number
}

export interface BibleResultEmpty extends Omit<BibleResult, 'ranges'> {
  copyrightPage: unknown
  ranges: []
}

export interface BibleResultSingle extends Omit<BibleResult, 'ranges'> {
  ranges: Partial<Record<`${number}`, BibleRangeSingle>>
}

export interface BibleVerse {
  abbreviatedCitation: string
  bookNumber: number
  chapterNumber: number
  content: string
  standardCitation: string
  verseNumber: number
  vsID: `${number}`
}
