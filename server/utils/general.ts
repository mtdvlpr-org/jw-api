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

    const lang = url.searchParams.get('lang')
    if (lang && isJwLangCode(lang)) return lang

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

export const formatIssue = (year: number, month: number, day?: number) =>
  `${year}${month.toString().padStart(2, '0')}${day?.toString().padStart(2, '0') ?? ''}` as `${number}`

export const getWorkbookIssue = (date?: { month: number; year: number }): `${number}` => {
  const year = date?.year ?? new Date().getFullYear()
  const month = date?.month ?? new Date().getMonth() + 1

  if (year < 2016) {
    throw createBadRequestError('Workbooks are not available before 2016.')
  }

  if (month < 1 || month > 12) {
    throw createBadRequestError('Month must be between 1 and 12.')
  }

  // Workbooks before 2021 are published every month.
  if (year <= 2020) return formatIssue(year, month)

  // Workbooks after 2021 are published every other month.
  return month % 2 === 0 ? formatIssue(year, month - 1) : formatIssue(year, month)
}

export const getStudyWatchtowerIssue = (date?: { month: number; year: number }): `${number}` => {
  const year = date?.year ?? new Date().getFullYear()
  const month = date?.month ?? new Date().getMonth() + 1

  if (year < 2008) {
    throw createBadRequestError('Study watchtower is not available before 2008.')
  }

  if (month < 1 || month > 12) {
    throw createBadRequestError('Month must be between 1 and 12.')
  }

  // Study watchtowers before 2016 are published on the 15th of the month.
  if (year <= 2015) return formatIssue(year, month, 15)

  // Study watchtowers after 2016 are published monthly.
  return formatIssue(year, month)
}

export const extractDateFromTitle = (
  title: string
): null | {
  endDay: string
  endMonth: string
  startDay: string
  startMonth: string
  year?: string
} => {
  const match = title.match(
    /\((?:(\d+)(?:\s+([^-]+))?-(\d+)\s+([A-Za-z]+)|([A-Za-z]+)\s+(\d+)(?:-([A-Za-z]+)\s+(\d+)|-(\d+)))\)$/
  )

  if (match) {
    if (match[1]) {
      // Format: (StartDay[-StartMonth]-EndDay EndMonth)
      // Groups: 1=StartDay, 2=StartMonth?, 3=EndDay, 4=EndMonth
      const [, startDay, startMonth, endDay, endMonth] = match
      return {
        endDay: endDay!,
        endMonth: endMonth!,
        startDay: startDay!,
        startMonth: startMonth ?? endMonth!
      }
    } else {
      // Format: (StartMonth StartDay-[EndMonth] EndDay)
      // Groups: 5=StartMonth, 6=StartDay, 7=EndMonth?, 8=EndDay(with month), 9=EndDay(no month)
      const [, , , , , startMonth, startDay, endMonth, endDayWithMonth, endDayNoMonth] = match
      const endDay = endDayWithMonth ?? endDayNoMonth
      return {
        endDay: endDay!,
        endMonth: endMonth ?? startMonth!,
        startDay: startDay!,
        startMonth: startMonth!
      }
    }
  }

  // Matches "January 10-12, 2024: Title" or "10-12 January 2024: Title"
  const match2 = title.match(
    /^(?:([A-Za-z]+)\s+(\d+)(?:-([A-Za-z]+)\s+(\d+)|-(\d+))|(\d+)(?:\s+([A-Za-z]+))?-(\d+)\s+([A-Za-z]+)),?\s+(\d{4}):/
  )

  if (match2) {
    if (match2[1]) {
      // Format: Month StartDay-[EndMonth] EndDay
      // Groups: 1=StartMonth, 2=StartDay, 3=EndMonth?, 4=EndDay(with month), 5=EndDay(no month), 10=Year
      const [, startMonth, startDay, endMonth, endDayWithMonth, endDayNoMonth, , , , , year] =
        match2
      const endDay = endDayWithMonth ?? endDayNoMonth
      return {
        endDay: endDay!,
        endMonth: endMonth ?? startMonth!,
        startDay: startDay!,
        startMonth: startMonth!,
        year: year!
      }
    } else {
      // Format: StartDay [StartMonth]-EndDay EndMonth
      // Groups: 6=StartDay, 7=StartMonth?, 8=EndDay, 9=EndMonth, 10=Year
      const [, , , , , , startDay, startMonth, endDay, endMonth, year] = match2
      return {
        endDay: endDay!,
        endMonth: endMonth!,
        startDay: startDay!,
        startMonth: startMonth ?? endMonth!,
        year: year!
      }
    }
  }

  return null
}
