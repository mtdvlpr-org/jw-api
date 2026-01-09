import type { Readable } from 'node:stream'

import JSZip from 'jszip'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGunzip } from 'node:zlib'

/**
 * Decompresses a gzip-compressed file (`.gz`).
 * @param fileStream The file stream to decompress.
 * @param outputPath The path to the output file.
 * @returns A promise that resolves when the decompression is complete.
 */
export const decompressGzip = async (fileStream: Readable, outputPath: string): Promise<void> => {
  return await pipeline(fileStream, createGunzip(), createWriteStream(outputPath))
}

/**
 * Extracts the files from a zip file.
 * @param data The data to extract the files from.
 * @returns The zip file contents.
 */
export const extractZipFiles = async (
  data: ArrayBuffer | Buffer | string | Uint8Array<ArrayBufferLike>
) => {
  logger.debug(`Extracting zip files from data...`)
  try {
    const appZip = new JSZip()
    return await appZip.loadAsync(data)
  } catch (e) {
    throw apiInternalError(
      `Failed to extract zip files: ${e instanceof Error ? e.message : String(e)}`,
      {
        cause: e
      }
    )
  }
}
