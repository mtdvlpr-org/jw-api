import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'Bible'

const defaultFetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)'
  },
  retry: 2,
  retryDelay: 1000,
  timeout: 30000
} satisfies FetchOptions

/**
 * Repository for Bible resources.
 */
export const bibleRepository = {
  /**
   * Fetches a book of the Bible.
   * @param book The book number.
   * @param locale The language of the Bible.
   * @returns The book data.
   * @throws If the book is not found or the service is unavailable.
   */
  fetchBibleBook: defineCachedFunction(
    async (book: BibleBookNr, locale: JwLangSymbol) => {
      try {
        const url = await scrapeBibleDataUrl(locale)
        const startVerseId = generateVerseId(book, 1, 1)
        const endVerseId = generateVerseId(book, 999, 999)
        const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

        const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

        const rangesData = Object.values(result.ranges ?? {})[0] ?? null

        if (!rangesData) {
          throw apiNotFoundError(`Book ${book} not found for locale '${locale}'`)
        }

        return { book: result.editionData.books[book], range: rangesData }
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Book ${book} not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleBook' }
  ),

  /**
   * Fetches a chapter of the Bible.
   * @param book The book number.
   * @param chapter The chapter number.
   * @param locale The language of the Bible.
   * @returns The chapter data.
   * @throws If the chapter is not found or the service is unavailable.
   */
  fetchBibleChapter: defineCachedFunction(
    async (book: BibleBookNr, chapter: number, locale: JwLangSymbol) => {
      try {
        const url = await scrapeBibleDataUrl(locale)
        const startVerseId = generateVerseId(book, chapter, 1)
        const endVerseId = generateVerseId(book, chapter, 999)
        const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

        const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

        const chapterData = result.ranges?.[range]

        if (!chapterData) {
          throw apiNotFoundError(
            `Chapter ${chapter} of book ${book} not found for locale '${locale}'`
          )
        }

        return chapterData
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Chapter ${chapter} of book ${book} not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleChapter' }
  ),

  /**
   * Fetches information about the Bible.
   * @param locale The language of the Bible.
   * @returns The Bible data.
   * @throws If the Bible data is not found or the service is unavailable.
   */
  fetchBibleData: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      try {
        const url = await scrapeBibleDataUrl(locale)
        return await $fetch<BibleResultEmpty>(url, { ...defaultFetchOptions })
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Bible data not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleData' }
  ),

  /**
   * Fetches a verse of the Bible.
   * @param book The book number.
   * @param chapter The chapter number.
   * @param verseNumber The verse number.
   * @param locale The language of the Bible.
   * @returns The verse data.
   * @throws If the verse is not found or the service is unavailable.
   */
  fetchBibleVerse: defineCachedFunction(
    async (book: BibleBookNr, chapter: number, verseNumber: number, locale: JwLangSymbol) => {
      try {
        const url = await scrapeBibleDataUrl(locale)
        const verseId = generateVerseId(book, chapter, verseNumber)

        const result = await $fetch<BibleResultSingle>(`${url}/${verseId}`, {
          ...defaultFetchOptions
        })

        const verse = result.ranges?.[verseId]?.verses?.[0]

        if (!verse) {
          throw apiNotFoundError(
            `Verse ${verseNumber} of chapter ${chapter}, book ${book} not found for locale '${locale}'`
          )
        }

        return verse
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw toFetchApiError(error, {
          notFoundMessage: `Verse ${verseNumber} of chapter ${chapter}, book ${book} not found for locale '${locale}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleVerse' }
  )
}
