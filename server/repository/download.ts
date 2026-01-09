import type { ReadableStream } from 'node:stream/web'
import type { FetchOptions } from 'ofetch'

const SERVICE_NAME = 'Download'

export const downloadRepository = {
  /**
   * Downloads content as an ArrayBuffer.
   * @param url The URL to download from.
   * @param options Fetch options.
   * @returns The content as ArrayBuffer.
   * @throws If the download fails.
   */
  arrayBuffer: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    try {
      return await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer', ...options })
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Resource not found at '${url}'`,
        serviceName: SERVICE_NAME
      })
    }
  },

  /**
   * Downloads content as a Blob.
   * @param url The URL to download from.
   * @param options Fetch options.
   * @returns The content as Blob.
   * @throws If the download fails.
   */
  blob: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    try {
      return await $fetch<Blob>(url, { responseType: 'blob', ...options })
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Resource not found at '${url}'`,
        serviceName: SERVICE_NAME
      })
    }
  },

  /**
   * Downloads content as a stream.
   * @param url The URL to download from.
   * @param options Fetch options.
   * @returns The content as a stream.
   * @throws If the download fails.
   */
  stream: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    try {
      return await $fetch<ReadableStream>(url, { responseType: 'stream', ...options })
    } catch (error) {
      throw toFetchApiError(error, {
        notFoundMessage: `Resource not found at '${url}'`,
        serviceName: SERVICE_NAME
      })
    }
  },

  /**
   * Downloads content as text.
   * @param url The URL to download from.
   * @param options Fetch options.
   * @returns The content as text.
   * @throws If the download fails.
   */
  text: defineCachedFunction(
    async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
      try {
        return await $fetch<string>(url, { responseType: 'text', ...options })
      } catch (error) {
        throw toFetchApiError(error, {
          notFoundMessage: `Resource not found at '${url}'`,
          serviceName: SERVICE_NAME
        })
      }
    },
    { maxAge: 60 * 60 * 24, name: 'downloadRepository.text' }
  )
}
