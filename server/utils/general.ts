export const isMediaKey = (input?: string): input is MediaKey => {
  return !!input && (input.startsWith('docid-') || input.startsWith('pub-'))
}

export const generateMediaKey = (
  publication: PublicationDocFetcher | PublicationFetcher
): MediaKey => {
  const audioFormats: Set<PublicationFileFormat> = new Set(['AAC', 'MP3'])
  const videoFormats: Set<PublicationFileFormat> = new Set(['3GP', 'M4V', 'MP4'])

  return [
    publication.docid ? `docid-${publication.docid}` : `pub-${publication.pub}`,
    publication.docid ? null : publication.issue?.toString().replace(/(\d{6})00$/gm, '$1'),
    publication.track,
    publication.fileformat
      ? videoFormats.has(publication.fileformat)
        ? 'VIDEO'
        : audioFormats.has(publication.fileformat)
          ? 'AUDIO'
          : null
      : null
  ]
    .filter((v) => !!v && v !== '0')
    .join('_') as MediaKey
}

export const isJwLangCode = (input: string): input is JwLangCode => {
  return jwLangCodes.includes(input as JwLangCode)
}

export const extractLangCode = (input: string): JwLangCode | null => {
  if (isJwLangCode(input)) return input

  try {
    const url = new URL(input)

    const wtlocale = url.searchParams.get('wtlocale')
    if (wtlocale && isJwLangCode(wtlocale)) return wtlocale

    const langwritten = url.searchParams.get('langwritten')
    if (langwritten && isJwLangCode(langwritten)) return langwritten

    return null
  } catch {
    return null
  }
}

export const extractMediaKey = (input: string): MediaKey | null => {
  if (isMediaKey(input)) return input

  try {
    const url = new URL(input)

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

export const generateVerseId = (
  book: number,
  chapter: number,
  verseNumber: number
): `${number}` => {
  return `${book}${chapter.toString().padStart(3, '0')}${verseNumber.toString().padStart(3, '0')}` as `${number}`
}

export const extractResolution = (file: MediaItemFile): number => {
  const resolution = file.label.match(/(\d+)p/)?.[1]
  if (!resolution) return 0
  return parseInt(resolution)
}

export const findBestFile = (
  media: MediaItemFile[],
  withSubtitles = false
): MediaItemFile | null => {
  if (media.length === 0) return null
  if (media.length === 1) return media[0]!

  const sorted = [...media].sort((a, b) => extractResolution(b) - extractResolution(a))
  return withSubtitles ? (sorted.find((file) => file.subtitles) ?? sorted[0]!) : sorted[0]!
}

export const findBestImage = (images: MediaItem['images']) => {
  for (const type of imageTypes) {
    for (const size of imageSizes) {
      const image = images[type]?.[size]
      if (image) return image
    }
  }
  return null
}
