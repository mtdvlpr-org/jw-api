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
 * Fetches multimedia from a book of the Bible.
 * @param book The book number.
 * @param locale The language of the Bible.
 * @returns The multimedia.
 * @throws If the book is not found or the service is unavailable.
 */
const fetchBibleMultimedia = defineCachedFunction(
  async (book: BibleBookNr, locale: JwLangSymbol) => {
    try {
      const url = (await scrapeBibleDataUrl(locale)).replace('/data', '/multimedia')

      const result = await $fetch<BibleResultMultimedia>(`${url}/${book}`, {
        ...defaultFetchOptions
      })

      const rangesData = Object.values(result.ranges ?? {})[0] ?? null

      if (!rangesData) {
        throw apiNotFoundError(`Book ${book} multimedia not found for locale '${locale}'`)
      }

      return rangesData
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Book ${book} multimedia not found for locale '${locale}'`,
        serviceName: SERVICE_NAME
      })
    }
  },
  { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleMultimedia' }
)

/**
 * Fetches a Bible range.
 * @param start The start of the range.
 * @param end The end of the range.
 * @param locale The language of the Bible.
 * @returns The range data.
 * @throws If the book is not found or the service is unavailable.
 */
const fetchBibleRange = defineCachedFunction(
  async (
    start: { book: BibleBookNr; chapter: number; verse: number },
    end: { book: BibleBookNr; chapter: number; verse: number },
    locale: JwLangSymbol
  ) => {
    try {
      const url = await scrapeBibleDataUrl(locale)
      const startVerseId = generateVerseId(start.book, start.chapter, start.verse)
      const endVerseId = generateVerseId(end.book, end.chapter, end.verse)
      const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

      const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

      const rangesData = Object.values(result.ranges ?? {})[0] ?? null

      if (!rangesData) {
        throw apiNotFoundError(`Range not found for locale '${locale}'`)
      }

      return rangesData
    } catch (error) {
      if (isApiError(error)) {
        throw error
      }
      throw toFetchApiError(error, {
        notFoundMessage: `Range not found for locale '${locale}'`,
        serviceName: SERVICE_NAME
      })
    }
  },
  { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleRange' }
)

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
        const startVerseId = generateVerseId(book, 0, 0)
        const endVerseId = generateVerseId(book, 999, 999)
        const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

        const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

        const rangesData = Object.values(result.ranges ?? {})[0] ?? null

        if (!rangesData) {
          throw apiNotFoundError(`Book ${book} not found for locale '${locale}'`)
        }

        const bookData = result.editionData.books[book]

        const multimediaResult = await fetchBibleMultimedia(book, locale)
        const validRange = multimediaResult.validRange

        if (rangesData.validRange === validRange) {
          return { book: bookData, range: rangesData }
        }

        let mergedRange: BibleRange = rangesData
        const totalRange = parseBibleRangeId(validRange).end
        let fetchedRange = parseBibleRangeId(rangesData.validRange).end

        while (JSON.stringify(fetchedRange) !== JSON.stringify(totalRange)) {
          const nextRange = await fetchBibleRange(
            { ...fetchedRange, verse: fetchedRange.verse + 1 },
            totalRange,
            locale
          )

          mergedRange = {
            ...multimediaResult,
            chapterOutlines: [
              ...(mergedRange.chapterOutlines ?? []),
              ...(nextRange.chapterOutlines ?? [])
            ],
            commentaries: [...(mergedRange.commentaries ?? []), ...(nextRange.commentaries ?? [])],
            crossReferences: [
              ...(mergedRange.crossReferences ?? []),
              ...(nextRange.crossReferences ?? [])
            ],
            footnotes: [...(mergedRange.footnotes ?? []), ...(nextRange.footnotes ?? [])],
            html: (mergedRange.html ?? '') + (nextRange.html ?? ''),
            pubReferences: [
              ...(mergedRange.pubReferences ?? []),
              ...(nextRange.pubReferences ?? [])
            ],
            superscriptions: [
              ...(mergedRange.superscriptions ?? []),
              ...(nextRange.superscriptions ?? [])
            ],
            verses: [...(mergedRange.verses ?? []), ...(nextRange.verses ?? [])]
          }

          fetchedRange = parseBibleRangeId(nextRange.validRange).end
        }

        return { book: bookData, range: mergedRange }
      } catch (error) {
        if (isApiError(error)) {
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
        return await fetchBibleRange(
          { book, chapter, verse: 0 },
          { book, chapter, verse: 999 },
          locale
        )
      } catch (error) {
        if (isApiError(error)) {
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
        if (isApiError(error)) {
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

  fetchBibleMultimedia,

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
        if (isApiError(error)) {
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
