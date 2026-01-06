export interface JwLanguage {
  altSpellings: string[]
  direction: 'ltr' | 'rtl'
  hasWebContent: boolean
  isCounted: boolean
  isSignLanguage: boolean
  langcode: JwLangCode
  name: string
  script: JwLangScript
  symbol: JwLangSymbol
  vernacularName: string
}
export interface JwLanguageResult {
  languages: JwLanguage[]
  localizedCount: string
  status: number
}
