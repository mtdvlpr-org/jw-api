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
  }[]
}
/* eslint-enable perfectionist/sort-interfaces */

export interface BibleBookAdditionalPage extends BibleAdditionalPageChild {
  type: 'introduction' | 'outline'
}

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
  /**
   * The content of the chapter outline in HTML.
   * @example '<ul><li class="L1">\n\n<p id="p3" data-pid="3">Creation of heavens and earth <span class="altsize">(</span><a class=' jsBibl… target='_blank'><span class="altsize">24-31</span></a><span class="altsize">)</span></p>\n\n\n\n\n\n\n</li></ul></li></ul>'
   */
  content: string
  id: number
  source: BibleRangeId
  title: string
  type: 'overview' | string
}

export interface BibleCommentary {
  /**
   * The content of the commentary in HTML.
   * @example '<p id="p4" data-pid="4" class="s5"><strong>Matthew:</strong> The Greek name rendered “Matthew” is probably a shortened form …me of the writer may have come about for practical reasons, providing a clear means of identification of the books.</p>\r\n'
   */
  content: null | string
  id: number
  /**
   * The label of the commentary.
   * @example '<strong>Title</strong>\n'
   */
  label: null | string
  source: BibleVerseId | null
}

export interface BibleCopyrightPage extends BibleAdditionalPage {
  galleryDisclaimer: string
}

export interface BibleCrossReference {
  id: number
  source: BibleVerseId
  targets: {
    /**
     * The abbreviated citation of the cross reference in HTML.
     * @example 'Ps&nbsp;102:25'
     */
    abbreviatedCitation: string
    category: { id: `${number}`; label: string }
    /**
     * The standard citation of the cross reference in HTML.
     * @example 'Psalm&nbsp;102:25'
     */
    standardCitation: string
    vs: BibleRangeId | BibleVerseId
  }[]
}

export interface BibleFootnote {
  anchor: string
  /**
   * The content of the footnote in HTML.
   * @example '<span class="">Or “God’s spirit.”</span>'
   */
  content: string
  id: number
  source: BibleVerseId
}

export interface BibleMultimediaItem {
  /**
   * The caption of the multimedia item in HTML.
   * @example '<p>Caption</p>\r\n'
   */
  caption: null | string
  docID: `${number}`
  id: number
  keyframe: null | { sizes: Record<ImageSize, string>; src: string; zoom: string }
  /**
   * The label of the multimedia item in HTML.
   * @example 'Gospel of Matthew—Some Major Events\n'
   */
  label: string
  pictureCredit: null | string
  resource: { src: (string | { pub: string; style: string; track: `${number}` })[] | string }
  source: BibleVerseSource
  sourceStandardCitations: {
    /**
     * The abbreviated citation of the standard citation in HTML.
     * @example 'Ge&nbsp;1:1'
     */
    abbreviatedCitation: string
    link: string
    /**
     * The standard citation of the standard citation in HTML.
     * @example 'Genesis&nbsp;1:1'
     */
    standardCitation: string
    vs: BibleVerseId
  }[]
  thumbnail: { sizes: Record<ImageSize, string>; src: string; zoom: string }
  type: 'image' | 'video'
}

export interface BiblePubReference {
  /**
   * The content of the pub reference in HTML.
   * @example '<p id="p1" data-pid="1">Content</p>\r\n'
   */
  content: string
  id: number
  source: BibleRangeSource
  thumbnail: { sizes: Record<ImageSize, string>; src: string; zoom: string }
  type: 'video'
  url: string
}

export interface BibleRange {
  chapterOutlines: BibleChapterOutline[]
  /**
   * The citation of the range in HTML.
   * @example 'Genesis&nbsp;1:1-31'
   */
  citation: string
  citationVerseRange: BibleRangeString
  commentaries: BibleCommentary[]
  crossReferences: BibleCrossReference[]
  footnotes: BibleFootnote[]
  html: string
  link: string
  multimedia: BibleMultimediaItem[]
  pubReferences: BiblePubReference[]
  superscriptions: BibleSuperscription[]
  validRange: BibleRangeId
  verses: BibleVerse[]
}

/**
 * The string representation of a verse range in BBCCCVVV-BBCCCVVV format.
 * @example '1001001-1001005' // Genesis 1:1-5
 * @example '19025012-19025015' // Psalms 25:12-15
 * @example '40001001-40013005' // Matthew 1:1-13:5
 */
export type BibleRangeId = `${BibleVerseId}-${BibleVerseId}`

export type BibleRangeMultimedia = Pick<
  BibleRange,
  'citation' | 'citationVerseRange' | 'link' | 'multimedia' | 'validRange'
>

export interface BibleRangeSingle extends Omit<BibleRange, 'citationVerseRange' | 'validRange'> {
  citationVerseRange: BibleVerseString
  validRange: BibleVerseId
}

/**
 * The ID of a range or a comma separated list of range IDs.
 * @example '01001001-01001005' // Genesis 1:1-5
 * @example '01001001-01001005,19025012-19025015' // Genesis 1:1-5, Psalms 25:12-15
 */
export type BibleRangeSource = BibleRangeId | string

/**
 * Human readable representation of a verse range.
 * @example '1:1-5'
 * @example '19:12-15'
 * @example '1:1-13:5'
 */
export type BibleRangeString =
  | `${number}:${number}-${number}:${number}`
  | `${number}:${number}-${number}`

export interface BibleResult {
  additionalPages: BibleAdditionalPage[]
  currentLocale: JwLangSymbol
  editionData: {
    bookCount: `${number}`
    books: Record<BibleBookNr, BibleBook>
    locale: JwLangSymbol
    titleFormat: string
    url: string
    vernacularAbbreviation: string
    vernacularFullName: string
    vernacularShortName: null | string
  }
  ranges: Partial<Record<BibleRangeId, BibleRange>>
  status: number
}

export interface BibleResultEmpty extends Omit<BibleResult, 'ranges'> {
  copyrightPage: BibleCopyrightPage
  ranges: []
}

export interface BibleResultMultimedia extends Pick<
  BibleResult,
  'currentLocale' | 'editionData' | 'status'
> {
  ranges: Partial<Record<BibleRangeId, BibleRangeMultimedia>>
}

export interface BibleResultSingle extends Omit<BibleResult, 'ranges'> {
  ranges: Partial<Record<BibleVerseId, BibleRangeSingle>>
}

export interface BibleSuperscription {
  /**
   * The abbreviated citation of the superscription in HTML.
   * @example 'Ps&nbsp;23:superscription'
   */
  abbreviatedCitation: string
  /**
   * The content of the superscription in HTML.
   * @example '<span class="style-w">A melody of David.</span>\r\n<span class="parabreak"></span>'
   */
  content: string
  id: number
  source: BibleVerseId
  /**
   * The standard citation of the superscription in HTML.
   * @example 'Psalm&nbsp;23:superscription'
   */
  standardCitation: string
}

export interface BibleVerse {
  /**
   * The abbreviated citation of the verse in HTML.
   * @example 'Ge&nbsp;1:1'
   */
  abbreviatedCitation: string
  bookNumber: BibleBookNr
  chapterNumber: number
  /**
   * The content of the verse in HTML.
   * @example '<span class="style-b"><span class="chapterNum"><a href='/en/library/bible/study-bible/books/json/data/01001000-01001999#v100… the beginning God created the heavens and the earth.<xref id="210572864"></xref></span>\r\n<span class="parabreak"></span'
   */
  content: string
  /**
   * The standard citation of the verse in HTML.
   * @example 'Genesis&nbsp;1:1'
   */
  standardCitation: string
  verseNumber: number
  vsID: BibleVerseId
}

/**
 * The ID of a verse in BBCCCVVV format.
 * @example '1001001' // Genesis 1:1
 * @example '19025012' // Psalms 25:12
 * @example '40013005' // Matthew 13:5
 */
export type BibleVerseId = `${number}`

/**
 * The ID of a verse or a comma separated list of verse IDs.
 * @example '1001001' // Genesis 1:1
 * @example '1001001,19025012,40013005' // Genesis 1:1, Psalms 25:12, Matthew 13:5
 */
export type BibleVerseSource = BibleVerseId | string

/**
 * Human readable representation of a verse.
 * @example '1:1'
 * @example '19:12'
 * @example '40:13'
 */
export type BibleVerseString = `${number}:${number}`
