import { bibleRepository } from '#server/repository/bible'

export const bibleService = {
  getBooks: async (locale: JwLangSymbol = 'en') => {
    const result = await bibleRepository.fetchBibleData(locale)
    return result.editionData.books
  },
  getChapter: async ({
    book,
    chapter,
    locale = 'en'
  }: {
    book: BibleBookNr
    chapter: number
    locale?: JwLangSymbol
  }) => {
    const result = await bibleRepository.fetchBibleChapter(locale, book, chapter)
    return result
  },
  getVerse: async ({
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
    return result
  }
}
