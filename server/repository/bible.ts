export const bibleRepository = {
  fetchBibleChapter: async (book: number, chapter: number, locale: JwLangSymbol) => {
    console.log('fetchBibleChapter', book, chapter, locale)
    const url = await scrapeBibleDataUrl(locale)

    const startVerseId = generateVerseId(book, chapter, 1)
    const endVerseId = generateVerseId(book, chapter, 999)
    const range: `${number}-${number}` = `${startVerseId}-${endVerseId}`

    const result = await $fetch<BibleResult>(`${url}/${range}`)

    const chapterData = result.ranges?.[range]

    if (!chapterData) {
      throw createNotFoundError('Could not find chapter data.', { book, chapter, locale })
    }

    return chapterData
  },
  fetchBibleData: async (locale: JwLangSymbol) => {
    console.log('fetchBibleData', locale)
    const url = await scrapeBibleDataUrl(locale)

    const result = await $fetch<BibleResultEmpty>(url)

    return result
  },
  fetchBibleVerse: async (
    book: number,
    chapter: number,
    verseNumber: number,
    locale: JwLangSymbol
  ) => {
    console.log('fetchBibleVerse', book, chapter, verseNumber, locale)
    const url = await scrapeBibleDataUrl(locale)

    const verseId = generateVerseId(book, chapter, verseNumber)

    const result = await $fetch<BibleResultSingle>(`${url}/${verseId}`)

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
  }
}
