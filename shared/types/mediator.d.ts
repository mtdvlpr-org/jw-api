import type { JwLangCode, JwLangScript, JwLangSymbol } from './lang.types'

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

export interface CategoryParent {
  description: string
  images: ImagesObject
  key: string
  name: string
  tags: CategoryTag[]
  type: string
}

export interface CategoryResult {
  category: Category
  language: MediatorResultLanguage
  pagination?: MediatorPagination
}

export interface CategoryResultDetailed extends CategoryResult {
  category: CategoryDetailed
}

export interface CategorySub extends CategoryParent {
  media?: MediaItem[]
}

export type ClientType =
  | 'appletv'
  | 'firetv'
  | 'JWORG'
  | 'none'
  | 'roku'
  | 'rwls'
  | 'satellite'
  | 'www'

export type ImageSize = 'lg' | 'md' | 'sm' | 'xl' | 'xs'

export type ImagesObject = Partial<Record<ImageType, Partial<Record<ImageSize, string>>>>
export type ImageType = 'cvr' | 'lsr' | 'lss' | 'pnr' | 'sqr' | 'sqs' | 'wsr' | 'wss'
export interface MediaDataResult {
  language: MediatorResultLanguage
  media: MediaItem[]
}

export interface MediaItem {
  availableLanguages: JwLangCode[]
  description: string
  duration: number
  durationFormattedHHMM: `${number}:${number}`
  durationFormattedMinSec: `${number}m ${number}s`
  files: MediaItemFile[]
  firstPublished: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  guid: string
  images: Partial<Record<ImageType, Partial<Record<ImageSize, string>>>>
  languageAgnosticNaturalKey: MediaKey
  naturalKey: string
  primaryCategory: string
  printReferences: string[]
  tags: string[]
  title: string
  type: string
}

export interface MediaItemFile {
  bitRate: number
  checksum: string
  duration: number
  filesize: number
  frameHeight: number
  frameRate: number
  frameWidth: number
  label: `${number}p`
  mimetype: `${string}/${string}`
  modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  progressiveDownloadURL: string
  subtitled: boolean
  subtitles?: {
    checksum: string
    modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
    url: string
  }
}

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
  script: JwLangScript
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
  script: JwLangScript
}

export type string = 'container' | 'ondemand'
