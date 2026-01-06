import type { FetchOptions } from 'ofetch'

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
   */
  fetchBibleBook: defineCachedFunction(
    async (book: BibleBookNr, locale: JwLangSymbol) => {
      const url = await scrapeBibleDataUrl(locale)
      const startVerseId = generateVerseId(book, 1, 1)
      const endVerseId = generateVerseId(book, 999, 999)
      const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

      const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

      const rangesData = Object.values(result.ranges ?? {})[0] ?? null

      if (!rangesData) {
        throw createNotFoundError('Could not find book data.', { book, locale })
      }

      return { book: result.editionData.books[book], range: rangesData }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleBook' }
  ),

  /**
   * Fetches a chapter of the Bible.
   * @param book The book number.
   * @param chapter The chapter number.
   * @param locale The language of the Bible.
   * @returns The chapter data.
   */
  fetchBibleChapter: defineCachedFunction(
    async (book: BibleBookNr, chapter: number, locale: JwLangSymbol) => {
      const url = await scrapeBibleDataUrl(locale)
      const startVerseId = generateVerseId(book, chapter, 1)
      const endVerseId = generateVerseId(book, chapter, 999)
      const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

      const result = await $fetch<BibleResult>(`${url}/${range}`, { ...defaultFetchOptions })

      const chapterData = result.ranges?.[range]

      if (!chapterData) {
        throw createNotFoundError('Could not find chapter data.', { book, chapter, locale })
      }

      return chapterData
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleChapter' }
  ),

  /**
   * Fetches information about the Bible.
   * @param locale The language of the Bible.
   * @returns The Bible data.
   */
  fetchBibleData: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      const url = await scrapeBibleDataUrl(locale)
      return await $fetch<BibleResultEmpty>(url, { ...defaultFetchOptions })
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
   */
  fetchBibleVerse: defineCachedFunction(
    async (book: BibleBookNr, chapter: number, verseNumber: number, locale: JwLangSymbol) => {
      const url = await scrapeBibleDataUrl(locale)
      const verseId = generateVerseId(book, chapter, verseNumber)

      const result = await $fetch<BibleResultSingle>(`${url}/${verseId}`, {
        ...defaultFetchOptions
      })

      const verse = result.ranges?.[verseId]?.verses?.[0]

      if (!verse) {
        throw createNotFoundError('Could not find verse data.', {
          book,
          chapter,
          locale,
          verseNumber
        })
      }

      return verse
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleVerse' }
  )
}
