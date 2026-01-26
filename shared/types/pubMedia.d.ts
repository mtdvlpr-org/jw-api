export type PubFetcher = PublicationBibleFetcher | PublicationDocFetcher | PublicationFetcher

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface Publication {
  pubName: string
  parentPubName: string
  booknum: 0 | BibleBookNr | null
  pub: string
  issue: '' | `${number}`
  /**
   * The formatted date of the publication in HTML.
   * @example 'November&nbsp;2022'
   */
  formattedDate: HTML
  fileformat: PublicationFileFormat[]
  track: null | number
  specialty: string
  pubImage: {
    url: string
    modifiedDatetime: ISODateTimeOffset
    checksum: string
  }
  languages: Partial<
    Record<
      JwLangCode,
      {
        name: string
        direction: 'ltr' | 'rtl'
        locale: JwLangSymbol
        script: JwLangScript
      }
    >
  >
  files: Partial<Record<JwLangCode, Partial<Record<PublicationFileFormat, PublicationFile[]>>>>
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */

export interface PublicationBibleFetcher {
  booknum: 0 | BibleBookNr
  fileformat?: PublicationFileFormat
  langwritten: JwLangCode
  pub: BiblePublication
  track?: number
}

export interface PublicationDocFetcher {
  docid: number
  fileformat?: PublicationFileFormat
  issue?: undefined
  langwritten: JwLangCode
  pub?: undefined
  track?: number
}

export interface PublicationFetcher {
  docid?: undefined
  fileformat?: PublicationFileFormat
  issue?: `${number}` | number
  langwritten: JwLangCode
  pub: string
  track?: number
}

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface PublicationFile {
  title: string
  file: {
    url: string
    stream: string
    modifiedDatetime: '' | HumanReadableDateTime
    checksum: string
  }
  filesize: number
  trackImage: {
    url: string
    modifiedDatetime: '' | ISODateTimeOffset
    checksum: null | string
  }
  markers: {
    mepsLanguageSpoken: JwLangCode
    mepsLanguageWritten: JwLangCode
    documentId: number
    type: 'publication' | string
    markers: {
      duration: Timestamp
      startTime: Timestamp
      label?: string
      endTransitionDuration?: Timestamp
      mepsParagraphId: number
    }[]
    hash: string
    introduction: {
      duration: Timestamp
      startTime: Timestamp
    }
  }
  label: `${number}p`
  track: number
  hasTrack: boolean
  pub: string
  docid: number
  booknum: 0 | BibleBookNr | null
  mimetype: `${string}/${string}`
  edition: string
  editionDescr: string
  format: string
  formatDescr: string
  specialty: string
  specialtyDescr: string
  subtitled: boolean
  frameWidth: number
  frameHeight: number
  frameRate: number
  duration: number
  bitRate: number
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */
