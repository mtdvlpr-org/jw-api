import type { RequiredFields } from './general'
import type { JwLangCode, JwLangScript, JwLangSymbol } from './lang.types'

export interface CategoriesResult {
  categories: CategoryParent[]
  language: MediatorResultLanguage
}

export type Category = CategoryContainer | CategoryOnDemand

export interface CategoryContainer extends Omit<CategoryGeneric, 'media'> {
  key: CategoryKeyContainer
  type: 'container'
}
export interface CategoryContainerDetailed extends Omit<CategoryDetailedGeneric, 'media'> {
  key: CategoryKeyContainer
  type: 'container'
}
export interface CategoryContainerParent extends CategoryParentGeneric {
  key: CategoryKeyContainer
  type: 'container'
}
export interface CategoryContainerSub extends Omit<CategorySubGeneric, 'media'> {
  key: CategoryKeyContainer
  type: 'container'
}

export type CategoryDetailed = CategoryContainerDetailed | CategoryOnDemandDetailed
export interface CategoryDetailedGeneric extends CategoryGeneric {
  subcategories?: CategorySub[]
}
export interface CategoryDetailedResult extends CategoryResult {
  category: CategoryDetailed
}

export interface CategoryGeneric extends CategorySubGeneric {
  parentCategory: CategoryParent | null
}

export type CategoryKey = CategoryKeyContainer | CategoryKeyOnDemand

export type CategoryKeyContainer =
  | 'Audio'
  | 'ConvReleases'
  | 'VideoOnDemand'
  | 'VODAudioDescriptions'
  | 'VODBible'
  | 'VODChildren'
  | 'VODFamily'
  | 'VODIntExp'
  | 'VODMinistry'
  | 'VODMovies'
  | 'VODMusicVideos'
  | 'VODOurActivities'
  | 'VODOurOrganization'
  | 'VODProgramsEvents'
  | 'VODSeries'
  | 'VODStudio'
  | 'VODTeenagers'
  | 'VOXBroadcasts'

export type CategoryKeyOnDemand =
  | 'AccomplishMinistry'
  | 'AllVideos'
  | 'AudioChildrenSongs'
  | 'AudioOriginalSongs'
  | 'BibleBooks'
  | 'BJF'
  | 'ChildrenMovies'
  | 'ChildrenSongs'
  | 'ChildrensSongs'
  | 'ConvDay2'
  | 'ConvDay3'
  | 'DramasGoodNews'
  | 'FamilyChallenges'
  | 'FamilyDatingMarriage'
  | 'FamilyMovies'
  | 'FamilyWorship'
  | 'FeaturedLibraryLanding'
  | 'FeaturedLibraryLandingUnpubLangs'
  | 'FeaturedLibraryVideos'
  | 'FeaturedSetTopBoxes'
  | 'KingdomMelodies'
  | 'LatestVideos'
  | 'MakingMusic'
  | 'MeetingsConventions'
  | 'MidweekMeeting'
  | 'OriginsLife'
  | 'Other'
  | 'Reports'
  | 'Satellite'
  | 'SeriesBibleBooks'
  | 'SeriesBibleChangesLives'
  | 'SeriesBibleTeachings'
  | 'SeriesBJFLessons'
  | 'SeriesBJFSongs'
  | 'SeriesDigForTreasures'
  | 'SeriesGoodNews'
  | 'SeriesGoodNewsAD'
  | 'SeriesHappyMarriage'
  | 'SeriesImitateFaith'
  | 'SeriesIronSharpens'
  | 'SeriesJehovahsFriends'
  | 'SeriesLearnFromThem'
  | 'SeriesLFFVideos'
  | 'SeriesMyTeenLife'
  | 'SeriesNeetaJade'
  | 'SeriesOrgAccomplishments'
  | 'SeriesOriginsLife'
  | 'SeriesOurHistory'
  | 'SeriesReasonsFaith'
  | 'SeriesTruthTransforms'
  | 'SeriesWasItDesigned'
  | 'SeriesWCGVideos'
  | 'SeriesWebsiteAppHelp'
  | 'SeriesWhatPeersSay'
  | 'SeriesWhereAreTheyNow'
  | 'SeriesWhiteboard'
  | 'SeriesWTLessons'
  | 'SJJChorus'
  | 'SJJInstrumental'
  | 'SJJMeetings'
  | 'StudioFeatured'
  | 'StudioMonthlyPrograms'
  | 'StudioNewsReports'
  | 'StudioTalks'
  | 'TeachingToolbox'
  | 'TeenGoals'
  | 'TeenMovies'
  | 'TeenSocialLife'
  | 'TeenSpiritualGrowth'
  | 'TeenWhatPeersSay'
  | 'Vocal'
  | 'VODActivitiesAVProduction'
  | 'VODActivitiesConstruction'
  | 'VODActivitiesPrintingShipping'
  | 'VODActivitiesReliefWork'
  | 'VODActivitiesSpecialEvents'
  | 'VODActivitiesTheoSchools'
  | 'VODActivitiesTranslation'
  | 'VODBibleAccounts'
  | 'VODBibleCreation'
  | 'VODBibleMedia'
  | 'VODBiblePrinciples'
  | 'VODBibleReadingStudy'
  | 'VODBibleTeachings'
  | 'VODBibleTranslations'
  | 'VODConvMusic'
  | 'VODIntExpArchives'
  | 'VODIntExpBlessings'
  | 'VODIntExpEndurance'
  | 'VODIntExpTransformations'
  | 'VODIntExpYouth'
  | 'VODLovePeople'
  | 'VODMinistryApplyTeaching'
  | 'VODMinistryExpandMinistry'
  | 'VODMinistryImproveSkills'
  | 'VODMinistryMethods'
  | 'VODMinistryMidweekMeeting'
  | 'VODMinistryTeachings'
  | 'VODMinistryTools'
  | 'VODMoviesAnimated'
  | 'VODMoviesBibleTimes'
  | 'VODMoviesExtras'
  | 'VODMoviesModernDay'
  | 'VODOrgBethel'
  | 'VODOrgBloodlessMedicine'
  | 'VODOrgHistory'
  | 'VODOrgLegal'
  | 'VODOriginalSongs'
  | 'VODPgmEvtAnnMtg'
  | 'VODPgmEvtGilead'
  | 'VODPgmEvtMorningWorship'
  | 'VODPgmEvtSpecial'
  | 'VODPureWorshipIntro'
  | 'VODSampleConversations'
  | 'VODSingToJah'
  | 'VODSJJMeetings'
  | 'VOXDramas'
  | 'VOXDramaticBibleReading'
  | 'VOXGBUpdates'
  | `${number}Convention`
  | `VOXBroadcasts${number}`

export interface CategoryOnDemand extends Required<CategoryGeneric> {
  key: CategoryKeyOnDemand
  type: 'ondemand'
}

export interface CategoryOnDemandDetailed extends RequiredFields<CategoryDetailedGeneric, 'media'> {
  key: CategoryKeyOnDemand
  type: 'ondemand'
}
export interface CategoryOnDemandParent extends CategoryParentGeneric {
  key: CategoryKeyOnDemand
  type: 'ondemand'
}
export interface CategoryOnDemandSub extends Required<CategorySubGeneric> {
  key: CategoryKeyOnDemand
  type: 'ondemand'
}
export type CategoryParent = CategoryContainerParent | CategoryOnDemandParent

export interface CategoryParentGeneric {
  description: string
  images: ImagesObject
  key: CategoryKey
  name: string
  tags: CategoryTag[]
  type: CategoryType
}
export type CategoryResult = CategoryResultContainer | CategoryResultOnDemand

export interface CategoryResultContainer extends Omit<CategoryResultGeneric, 'pagination'> {
  category: CategoryContainer
}

export interface CategoryResultGeneric {
  category: Category
  language: MediatorResultLanguage
  pagination?: MediatorPagination
}

export interface CategoryResultOnDemand extends Required<CategoryResultGeneric> {
  category: CategoryOnDemand
}

export type CategorySub = CategoryContainerSub | CategoryOnDemandSub

export interface CategorySubGeneric extends CategoryParentGeneric {
  media?: MediaItem[]
}
export type CategoryTag =
  | 'AllowPlayAllAsIconsInGrid'
  | 'AllowPlayAllInCategoryHeader'
  | 'AllowShuffleAsIconsInGrid'
  | 'AllowShuffleInCategoryHeader'
  | 'AllVideosExclude'
  | 'AppleTVExclude'
  | 'ExcludeFromBreadcrumbs'
  | 'FireTVExclude'
  | 'IncludeInJWORGAllVideosCatList'
  | 'JWLCatalogExclude'
  | 'JWLExclude'
  | 'JWORGExclude'
  | 'LibraryVideosExclude'
  | 'LimitToFive'
  | 'LimitToOne'
  | 'LimitToTwo'
  | 'PNRFeaturedLayout'
  | 'PreferSquareImages'
  | 'RokuCategoryCarouselList'
  | 'RokuCategoryGrid'
  | 'RokuCategoryGridScreen'
  | 'RokuCategorySelectionPosterScreen'
  | 'RokuExclude'
  | 'RokuGridStyleSquare'
  | 'RokuMediaItemListScreen'
  | 'RWLSExclude'
  | 'RWLSIncludeSubCategoriesAsNav'
  | 'SatelliteExclude'
  | 'SearchExclude'
  | 'StreamThisChannelEnabled'
  | 'SuppressTopCategoryBanner'
  | 'WebExclude'
  | 'WebFeatured'
  | 'WebIncludeSubCategoriesInNav'
  | 'WWWCatListExclude'
  | 'WWWExclude'
  | 'WWWIncludeSubCategoriesAsNav'

export type CategoryType = 'container' | 'ondemand'

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
  primaryCategory: CategoryKey
  printReferences: string[]
  tags: MediaItemTag[]
  title: string
  type: string
}

/* eslint-disable perfectionist/sort-interfaces */
export interface MediaItemFile {
  progressiveDownloadURL: string
  checksum: string
  filesize: number
  modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  bitRate: number
  duration: number
  frameHeight: number
  frameWidth: number
  label: `${number}p`
  frameRate: number
  mimetype: `${string}/${string}`
  subtitled: boolean
  subtitles?: {
    checksum: string
    modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
    url: string
  }
}
/* eslint-enable perfectionist/sort-interfaces */

export type MediaItemTag =
  | 'AllVideosExclude'
  | 'AppleTVExclude'
  | 'ConventionRelease'
  | 'FireTVExclude'
  | 'JWLCatalogExclude'
  | 'JWLExclude'
  | 'JWORGExclude'
  | 'LatestVideosExclude'
  | 'LibraryVideosExclude'
  | 'Month01'
  | 'Month02'
  | 'Month03'
  | 'Month04'
  | 'Month05'
  | 'Month06'
  | 'Month07'
  | 'Month08'
  | 'Month09'
  | 'Month10'
  | 'Month11'
  | 'Month12'
  | 'RokuExclude'
  | 'RWLSExclude'
  | 'SatelliteExclude'
  | 'SearchExclude'
  | 'WebExclude'
  | 'WWWExclude'

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
