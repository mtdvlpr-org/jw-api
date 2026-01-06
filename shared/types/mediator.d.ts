export interface CategoriesResult {
  categories: CategoryParent[]
  language: MediatorResultLanguage
}

export interface Category extends CategorySub {
  parentCategory: CategoryParent | null
}

export interface CategoryDetailed extends Category {
  subcategories?: CategorySub[]
}

export type CategoryKey = CategoryContainerKey | CategoryOnDemandKey

export interface CategoryParent {
  description: string
  images: ImagesObject
  key: CategoryKey
  name: string
  tags: CategoryTag[]
  type: CategoryType
}

export interface CategoryResult {
  category: Category
  language: MediatorResultLanguage
  pagination?: MediatorPagination
}

export interface CategoryResultDetailed extends Omit<CategoryResult, 'category'> {
  category: CategoryDetailed
}

export interface CategorySub extends CategoryParent {
  media?: MediaItem[]
}

export type CategoryType = 'container' | 'ondemand'

export type ImagesObject = Partial<Record<ImageType, Partial<Record<ImageSize, string>>>>

export interface MediaDataResult {
  language: MediatorResultLanguage
  media: MediaItem[]
}

export type MediaFetcher =
  | PublicationDocFetcher
  | PublicationFetcher
  | { key: MediaKey; langwritten: JwLangCode }

/* eslint-disable perfectionist/sort-interfaces */
export interface MediaItem {
  guid: string
  languageAgnosticNaturalKey: MediaKey
  naturalKey: string
  type: 'video' | string
  primaryCategory: CategoryKey
  title: string
  description: string
  firstPublished: ISODateTime
  duration: number
  durationFormattedHHMM: DurationHHMM
  durationFormattedMinSec: DurationMinSec
  tags: MediaTag[]
  files: MediaItemFile[]
  images: ImagesObject
  availableLanguages: JwLangCode[]
  printReferences: string[]
}
/* eslint-enable perfectionist/sort-interfaces */

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface MediaItemFile {
  progressiveDownloadURL: string
  checksum: string
  filesize: number
  modifiedDatetime: ISODateTime
  bitRate: number
  duration: number
  frameHeight: number
  frameWidth: number
  label: `${number}p`
  frameRate: number
  mimetype: `${string}/${string}`
  subtitled: boolean
  subtitles?: {
    url: string
    modifiedDatetime: ISODateTime
    checksum: string
  }
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */

export type MediaKey = `docid-${string}` | `pub-${string}`

export interface MediatorCategoryDetailedQuery extends MediatorCategoryQuery {
  mediaLimit?: number
}

export interface MediatorCategoryQuery {
  clientType?: ClientType
  limit?: number
  offset?: number
}

export interface MediatorLanguage {
  code: JwLangCode
  isLangPair: boolean
  isRTL: boolean
  isSignLanguage: boolean
  locale: JwLangSymbol
  name: string
  script: string
  vernacular: string
}

export interface MediatorLanguageResult {
  languages: MediatorLanguage[]
}

export interface MediatorPagination {
  limit: number
  offset: number
  totalCount: number
}

export interface MediatorResultLanguage {
  direction: 'ltr' | 'rtl'
  isSignLanguage: boolean
  languageCode: JwLangCode
  locale: JwLangSymbol
  script: string
}
