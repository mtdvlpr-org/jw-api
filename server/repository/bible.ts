export const bibleRepository = {
  fetchBibleChapter: async (book: BibleBookNr, chapter: number, locale: JwLangSymbol) => {
    const url = await scrapeBibleDataUrl(locale)

    const startVerseId = generateVerseId(book, chapter, 1)
    const endVerseId = generateVerseId(book, chapter, 999)
    const range = `${startVerseId}-${endVerseId}`

    const result = await $fetch<BibleResult>(`${url}/${range}`)

    const chapterData = result.ranges?.[range]

    if (!chapterData) throw new Error('Chapter not found')

    return chapterData
  },
  fetchBibleData: async (locale: JwLangSymbol) => {
    const url = await scrapeBibleDataUrl(locale)

    const result = await $fetch<BibleResultEmpty>(url)

    return result
  },
  fetchBibleVerse: async (
    book: BibleBookNr,
    chapter: number,
    verseNumber: number,
    locale: JwLangSymbol
  ) => {
    const url = await scrapeBibleDataUrl(locale)

    const verseId = generateVerseId(book, chapter, verseNumber)

    const result = await $fetch<BibleResultSingle>(`${url}/${verseId}`)

    const verse = result.ranges?.[verseId]?.verses?.[0]

    if (!verse) throw new Error('Verse not found')

    return verse
  }
}
