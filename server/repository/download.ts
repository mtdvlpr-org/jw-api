import type { ReadableStream } from 'node:stream/web'
import type { FetchOptions } from 'ofetch'

export const downloadRepository = {
  arrayBuffer: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    return await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer', ...options })
  },
  blob: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    return await $fetch<Blob>(url, { responseType: 'blob', ...options })
  },
  stream: async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
    return await $fetch<ReadableStream>(url, { responseType: 'stream', ...options })
  },
  text: defineCachedFunction(
    async (url: string, options: Omit<FetchOptions, 'method' | 'responseType'> = {}) => {
      return await $fetch<string>(url, { responseType: 'text', ...options })
    },
    { maxAge: 60 * 60 * 24, name: 'downloadRepository.text' }
  )
}
