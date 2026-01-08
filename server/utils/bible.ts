import { bibleRepository } from '#server/repository/bible'

/**
 * Gets the Bible data for a given locale.
 * @param locale The locale to get the Bible data for. Defaults to English.
 * @returns The Bible data.
 */
const getBibleData = async (locale: JwLangSymbol = 'en') => {
  const result = await bibleRepository.fetchBibleData(locale)
  return result
}

/**
 * Gets the books of the Bible for a given locale.
 * @param locale The locale to get the books of the Bible for. Defaults to English.
 * @returns The books of the Bible.
 */
const getBooks = async (locale: JwLangSymbol = 'en') => {
  const result = await bibleRepository.fetchBibleData(locale)
  return result.editionData.books
}

/**
 * Gets a book of the Bible for a given locale.
 * @param book The book of the Bible to get.
 * @param locale The locale to get the book for. Defaults to English.
 * @returns The book of the Bible.
 */
const getBook = async ({ book, locale = 'en' }: { book: BibleBookNr; locale?: JwLangSymbol }) => {
  return await bibleRepository.fetchBibleBook(book, locale)
}

/**
 * Gets a chapter of the Bible for a given locale.
 * @param book The book of the Bible to get the chapter for.
 * @param chapter The chapter of the Bible to get.
 * @param locale The locale to get the chapter for. Defaults to English.
 * @returns The chapter of the Bible.
 */
const getChapter = async ({
  book,
  chapter,
  locale = 'en'
}: {
  book: BibleBookNr
  chapter: number
  locale?: JwLangSymbol
}) => {
  return await bibleRepository.fetchBibleChapter(book, chapter, locale)
}

/**
 * Gets a verse of the Bible for a given locale.
 * @param book The book of the Bible to get the verse for.
 * @param chapter The chapter of the Bible to get the verse for.
 * @param locale The locale to get the verse for. Defaults to English.
 * @param verse The verse of the Bible to get.
 * @returns The verse of the Bible.
 */
const getVerse = async ({
  book,
  chapter,
  locale = 'en',
  verse
}: {
  book: BibleBookNr
  chapter: number
  locale?: JwLangSymbol
  verse: number
}) => {
  const result = await bibleRepository.fetchBibleVerse(book, chapter, verse, locale)
  const html = parseHtml(result.content)
  html.querySelector('span.chapterNum')?.remove()
  return { parsedContent: html.querySelector('span')?.textContent.trim(), result }
}

/**
 * A service wrapping the bible repository.
 */
export const bibleService = { getBibleData, getBook, getBooks, getChapter, getVerse }
