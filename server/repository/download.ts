import type { ReadableStream } from 'node:stream/web'

export const downloadRepository = {
  arrayBuffer: async (url: string) => {
    return await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' })
  },
  blob: defineCachedFunction(
    async (url: string) => {
      return await $fetch<Blob>(url, { responseType: 'blob' })
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'downloadRepository.blob' }
  ),
  stream: async (url: string) => {
    return await $fetch<ReadableStream>(url, { responseType: 'stream' })
  },
  text: defineCachedFunction(
    async (url: string) => {
      return await $fetch<string>(url, { responseType: 'text' })
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'downloadRepository.text' }
  )
}
