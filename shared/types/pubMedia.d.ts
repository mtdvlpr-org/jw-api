export type PubFetcher = PublicationBookFetcher | PublicationDocFetcher | PublicationFetcher

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface Publication {
  pubName: string
  parentPubName: string
  booknum: null | number
  pub: string
  issue: '' | `${number}`
  formattedDate: string
  fileformat: PublicationFileFormat[]
  track: null | number
  specialty: string
  pubImage: {
    url: string
    modifiedDatetime: string
    checksum: string
  }
  languages: Partial<
    Record<
      JwLangCode,
      {
        name: string
        direction: 'ltr' | 'rtl'
        locale: JwLangSymbol
        script: string
      }
    >
  >
  files: Partial<Record<JwLangCode, Partial<Record<PublicationFileFormat, PublicationFile[]>>>>
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */

export interface PublicationBookFetcher {
  booknum: number
  fileformat?: PublicationFileFormat
  langwritten: JwLangCode
  pub: 'nwt'
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
  issue?: number
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
    modifiedDatetime: '' | `${number}-${number}-${number} ${number}:${number}:${number}`
    checksum: string
  }
  filesize: number
  trackImage: {
    url: string
    modifiedDatetime:
      | ''
      | `${number}-${number}-${number}T${number}:${number}:${number}+${number}:${number}`
    checksum: null | string
  }
  markers: {
    mepsLanguageSpoken: JwLangCode
    mepsLanguageWritten: JwLangCode
    documentId: number
    type: string
    markers: {
      duration: `${number}:${number}:${number}.${number}`
      startTime: `${number}:${number}:${number}.${number}`
      label: string
      endTransitionDuration: `${number}:${number}:${number}.${number}`
      mepsParagraphId: number
    }[]
    hash: string
    introduction: {
      duration: `${number}:${number}:${number}.${number}`
      startTime: `${number}:${number}:${number}.${number}`
    }
  }
  label: `${number}p`
  track: number
  hasTrack: boolean
  pub: string
  docid: number
  booknum: number
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
