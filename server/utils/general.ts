/**
 * Pads a value with a character.
 * @param value The value to pad.
 * @param length The length of the padded value. Defaults to 2.
 * @param char The character to pad with. Defaults to '0'.
 * @returns The padded value.
 */
export const pad = (value: number | string, length = 2, char = '0') =>
  value.toString().padStart(length, char)

/**
 * Checks if a string is a JW language code.
 * @param input The string to check.
 * @returns True if the string is a JW language code, false otherwise.
 */
export const isJwLangCode = (input: string): input is JwLangCode => {
  return jwLangCodes.includes(input as JwLangCode)
}

/**
 * Checks if a string is a JW language symbol.
 * @param input The string to check.
 * @returns True if the string is a JW language symbol, false otherwise.
 */
export const isJwLangSymbol = (input?: string): input is JwLangSymbol => {
  return !!input && jwLangSymbols.includes(input as JwLangSymbol)
}

/**
 * Formats a URL.
 * @param base The base URL.
 * @param path The path to the URL.
 * @returns The formatted URL.
 */
export const formatUrl = (base: string, path: string) => {
  return new URL(path, base).toString()
}

/**
 * Extracts a language code from a string.
 * @param input The string to extract the language code from.
 * @returns The language code.
 */
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

/**
 * Generates a verse ID for a given book, chapter, and verse number.
 * @param book The book number.
 * @param chapter The chapter number.
 * @param verse The verse number.
 * @returns The verse ID.
 */
export const generateVerseId = (
  book: BibleBookNr,
  chapter: number,
  verse: number
): BibleVerseId => {
  return `${book}${pad(chapter, 3)}${pad(verse, 3)}` as BibleVerseId
}

/**
 * Formats an issue number for a given year, month, and day.
 * @param year The year.
 * @param month The month.
 * @param day The day.
 * @returns The formatted issue number.
 */
export const formatIssue = (year: number, month: number, day?: number) =>
  `${year}${pad(month)}${day ? pad(day) : ''}` as `${number}`

/**
 * Gets the workbook issue for a given date.
 * @param date The date to get the workbook issue for. Defaults to the current date.
 * @returns The workbook issue.
 */
export const getWorkbookIssue = (date?: { month: number; year: number }): `${number}` => {
  if (!date) {
    const today = new Date()
    date = { month: today.getMonth() + 1, year: today.getFullYear() }
  }

  const { month, year } = date

  if (year < 2016) {
    throw apiBadRequestError('Workbooks are not available before 2016')
  }

  if (month < 1 || month > 12) {
    throw apiBadRequestError('Month must be between 1 and 12')
  }

  // Workbooks before 2021 are published every month.
  if (year <= 2020) return formatIssue(year, month)

  // Workbooks after 2021 are published every other month.
  return month % 2 === 0 ? formatIssue(year, month - 1) : formatIssue(year, month)
}

/**
 * Gets the study watchtower issue for a given date.
 * @param date The date to get the study watchtower issue for. Defaults to the current date.
 * @returns The study watchtower issue.
 */
export const getStudyWatchtowerIssue = (date?: { month: number; year: number }): `${number}` => {
  if (!date) {
    const today = new Date()
    date = { month: today.getMonth() + 1, year: today.getFullYear() }
  }

  const { month, year } = date

  if (year < 2008) {
    throw apiBadRequestError('Study Watchtower is not available before 2008')
  }

  if (month < 1 || month > 12) {
    throw apiBadRequestError('Month must be between 1 and 12')
  }

  // Study watchtowers before 2016 are published on the 15th of the month.
  if (year <= 2015) return formatIssue(year, month, 15)

  // Study watchtowers after 2016 are published monthly.
  return formatIssue(year, month)
}

/**
 * Converts a language code to a MEPS ID.
 * @param lang The language code to convert.
 * @returns The MEPS ID.
 */
export const langCodeToMepsId = (lang: JwLangCode): number => {
  return parseInt(
    Object.entries(mepsLanguageIds).find(([, langcode]) => langcode === lang)?.[0] ?? '0'
  )
}

/**
 * Parses a Bible verse ID into its book, chapter, and verse components.
 * @param verseId The Bible verse ID to parse.
 * @returns The parsed components.
 */
export const parseBibleVerseId = (verseId: BibleVerseId) => {
  if (!/^[1-6]\d{6,7}$/.test(verseId)) {
    throw apiBadRequestError(`Invalid Bible verse ID: '${verseId}'`)
  }

  const startIndex = verseId.length === 7 ? 1 : 2
  const book = parseInt(verseId.slice(0, startIndex)) as BibleBookNr
  const chapter = parseInt(verseId.slice(startIndex, startIndex + 3))
  const verse = parseInt(verseId.slice(startIndex + 3, startIndex + 6))

  return { book, chapter, verse }
}

/**
 * Parses a Bible range ID into its start and end verse components.
 * @param rangeId The Bible range ID to parse.
 * @returns An object containing the start and end verse components.
 */
export const parseBibleRangeId = (rangeId: BibleRangeId) => {
  if (!/^[1-6]\d{6,7}-[1-6]\d{6,7}$/.test(rangeId)) {
    throw apiBadRequestError(`Invalid Bible range ID: '${rangeId}'`)
  }

  const [startVerseId, endVerseId] = rangeId.split('-') as [BibleVerseId, BibleVerseId]

  return {
    end: parseBibleVerseId(endVerseId),
    start: parseBibleVerseId(startVerseId)
  }
}
