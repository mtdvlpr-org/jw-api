export interface BibleAdditionalPage extends BibleAdditionalPageChild {
  children?: BibleAdditionalPageChild[]
}

export interface BibleAdditionalPageChild {
  abbreviatedTitle: string
  articleCSSClassNames: string
  docClass: `${number}`
  mepsTitle: string
  openLinksInReadingPane?: boolean
  pageCSSClassNames: string
  pageID: string
  title: string
  url: string
}

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
  additionalPages: BibleBookAdditionalPage[]
  images: {
    altText: string
    caption: null | string
    sizes: Partial<Record<ImageSize, string>>
    type: ImageType
  }
}
/* eslint-enable perfectionist/sort-interfaces */

export interface BibleBookAdditionalPage extends BibleAdditionalPageChild {
  type: 'introduction' | 'outline'
}

export interface BibleChapterOutline {
  content: string
  id: number
  source: string
  title: string
  type: string
}

export interface BibleCommentary {
  content: string
  id: number
  label: string
  source: `${number}`
}

export interface BibleCopyrightPage extends BibleAdditionalPage {
  galleryDisclaimer: string
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
  source: string
}

export interface BibleMultimediaItem {
  caption: null | string
  docID: `${number}`
  id: number
  keyframe: null | { sizes: Record<ImageSize, string>; src: string; zoom: string }
  label: string
  pictureCredit: null | string
  resource: { src: (string | { pub: string; style: string; track: `${number}` })[] }
  source: string
  sourceStandardCitations: {
    abbreviatedCitation: string
    link: string
    standardCitation: string
    vs: `${number}`
  }[]
  thumbnail: { sizes: Record<ImageSize, string>; src: string; zoom: string }
  type: 'image' | 'video'
}

export interface BiblePubReference {
  content: string
  id: number
  source: string
  thumbnail: { sizes: Record<ImageSize, string>; src: string; zoom: string }
  type: 'video'
  url: string
}

export interface BibleRange {
  chapterOutlines: BibleChapterOutline[]
  citation: string
  citationVerseRange: `${number}:${number}-${number}:${number}` | `${number}:${number}-${number}`
  commentaries: BibleCommentary[]
  crossReferences: BibleCrossReference[]
  footnotes: BibleFootnote[]
  html: string
  link: string
  multimedia: BibleMultimediaItem[]
  pubReferences: BiblePubReference[]
  superscriptions: BibleSuperscription[]
  validRange: `${`${number}`}-${`${number}`}`
  verses: BibleVerse[]
}

export interface BibleRangeSingle extends Omit<BibleRange, 'citationVerseRange'> {
  citationVerseRange: `${number}:${number}`
}

export interface BibleResult {
  additionalPages: BibleAdditionalPage[]
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
  copyrightPage: BibleCopyrightPage
  ranges: []
}

export interface BibleResultSingle extends Omit<BibleResult, 'ranges'> {
  ranges: Partial<Record<`${number}`, BibleRangeSingle>>
}

export interface BibleSuperscription {
  abbreviatedCitation: string
  content: string
  id: number
  source: string
  standardCitation: string
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
