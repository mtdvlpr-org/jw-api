import type { JwLangCode } from '../types/lang.types'
import type { PublicationFileFormat } from '../types/media.types'
import type { MediaItem, MediaItemFile, MediaKey } from '../types/mediator'
import type { PublicationDocFetcher, PublicationFetcher } from '../types/pubMedia'

/**
 * The regular expression to match a media key.
 * @example 'docid-123456_1_VIDEO'
 * @example 'pub-w_202301_1_VIDEO'
 * @example 'docid-123456_109_AUDIO'
 * @example 'pub-w_202301_1_AUDIO'
 * @example 'docid-123456_x_VIDEO'
 * @example 'pub-w_202301_x_VIDEO'
 * @example 'docid-123456_x_AUDIO'
 * @example 'pub-jwb-080_x_AUDIO'
 */
const MEDIA_KEY_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^(?:docid-(?<docid>[1-9]\d*)|pub-(?<pub>[a-zA-Z0-9-]+)(?:_(?<issue>[1-9]\d*))?)_(?<track>[1-9]\d*|x)_(?<type>VIDEO|AUDIO)$/

/**
 * Checks if a string is a media key.
 * @param input The string to check.
 * @returns True if the string is a media key, false otherwise.
 */
export const isMediaKey = (input?: string): input is MediaKey => {
  return !!input && MEDIA_KEY_REGEX.test(input)
}

/**
 * Generates a media key for a given publication.
 * @param publication The publication to generate the media key for.
 * @returns The media key.
 */
export const generateMediaKey = (
  publication: PublicationDocFetcher | PublicationFetcher
): MediaKey => {
  const audioFormats: Set<PublicationFileFormat> = new Set(['AAC', 'MP3'])

  return [
    publication.docid ? `docid-${publication.docid}` : `pub-${publication.pub}`,
    publication.docid ? null : publication.issue?.toString().replace(/(\d{6})00$/gm, '$1'),
    publication.track ? publication.track : 'x',
    audioFormats.has(publication.fileformat ?? 'MP4') ? 'AUDIO' : 'VIDEO' //  Default to video
  ]
    .filter((v) => !!v && v !== '0')
    .join('_') as MediaKey
}

/**
 * Extracts a media key from a string.
 * @param input The string to extract the media key from.
 * @returns The media key.
 */
export const extractMediaKey = (input: string): MediaKey | null => {
  if (isMediaKey(input)) return input

  try {
    const url = new URL(input)

    const item = url.searchParams.get('item')
    if (item && isMediaKey(item)) return item

    const lank = url.searchParams.get('lank')
    if (lank && isMediaKey(lank)) return lank

    const docid = url.searchParams.get('docid')
    if (docid && isMediaKey(docid)) return docid

    // eslint-disable-next-line no-useless-escape
    const idRegex = /\/((?:pub|docid)-[^\/]+)/

    const pathMatch = url.pathname.match(idRegex)
    if (pathMatch && isMediaKey(pathMatch[1])) return pathMatch[1]

    const hashMatch = url.hash.match(idRegex)
    if (hashMatch && isMediaKey(hashMatch[1])) return hashMatch[1]

    return null
  } catch {
    return null
  }
}

/**
 * Parses a media key into a publication fetcher.
 * @param key The media key to parse.
 * @param langwritten The language written to use. Defaults to 'E'.
 * @returns The publication fetcher.
 */
export const parseMediaKey = (
  key: string,
  langwritten: JwLangCode = 'E'
): null | PublicationDocFetcher | PublicationFetcher => {
  const match = key.match(MEDIA_KEY_REGEX)
  if (!match || !match.groups) return null

  const doc: null | PublicationDocFetcher = match.groups.docid
    ? {
        docid: parseInt(match.groups.docid),
        langwritten,
        track: match.groups.track === 'x' ? 0 : parseInt(match.groups.track!)
      }
    : null

  const pub: null | PublicationFetcher = match.groups.pub
    ? {
        issue: match.groups.issue ? parseInt(match.groups.issue) : undefined,
        langwritten,
        pub: match.groups.pub,
        track: match.groups.track === 'x' ? 0 : parseInt(match.groups.track!)
      }
    : null

  return doc ?? pub
}

/**
 * Extracts the resolution from a media item file.
 * @param file The media item file to extract the resolution from.
 * @returns The resolution.
 */
export const extractResolution = (file: MediaItemFile): number => {
  const resolution = file.label?.match(/(\d+)p/)?.[1]
  if (!resolution) return 0
  return parseInt(resolution)
}

/**
 * Finds the best file from a list of media item files.
 * @param media The media item files to find the best file from.
 * @param withSubtitles Whether to include files with subtitles. Defaults to false.
 * @returns The best file.
 */
export const findBestFile = (
  media: MediaItemFile[],
  withSubtitles = false
): MediaItemFile | null => {
  if (media.length === 0) return null

  // Sort the media item files by resolution, descending.
  const sorted = [...media].sort((a, b) => extractResolution(b) - extractResolution(a))

  // If subtitles are requested, return the first file with subtitles. Otherwise, return the highest resolution file.
  return withSubtitles ? (sorted.find((file) => file.subtitles) ?? null) : sorted[0]!
}

/**
 * Finds the best image from a list of images.
 * @param images The images to find the best image from.
 * @returns The best image.
 */
export const findBestImage = (images: MediaItem['images']) => {
  for (const type of imageTypes) {
    for (const size of imageSizes) {
      const image = images[type]?.[size]
      if (image) return image
    }
  }

  return null
}
