import type { Entry } from 'unzipper'

import fs from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'
import unzipper from 'unzipper'

/**
 * Converts a glob pattern to a regular expression.
 * Supports * (match any characters) and ? (match single character).
 *
 * @param pattern The glob pattern to convert.
 * @returns A RegExp object for matching the pattern.
 */
const globToRegex = (pattern: string): RegExp => {
  // Escape special regex characters except * and ?
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')

  return new RegExp(`^${escaped}$`)
}

/**
 * Checks if a file path matches a filename pattern.
 * Supports glob patterns like "*.db" or exact matches.
 *
 * @param entryPath The full path of the file in the zip.
 * @param pattern The filename pattern (can include glob wildcards * and ?).
 * @returns True if the path matches the pattern.
 */
const matchesPattern = (entryPath: string, pattern: string): boolean => {
  // Extract the filename from the path
  const fileName = entryPath.split('/').pop() || entryPath

  // Check for exact match first
  if (entryPath === pattern || entryPath.endsWith(`/${pattern}`)) {
    return true
  }

  // Check if pattern contains wildcards
  if (pattern.includes('*') || pattern.includes('?')) {
    const regex = globToRegex(pattern)
    return regex.test(fileName)
  }

  return false
}

/**
 * Decompresses a gzip-compressed file (`.gz`).
 * @param fileStream The file stream to decompress.
 * @param outputPath The path to the output file.
 * @returns A promise that resolves when the decompression is complete.
 */
export const decompressGzip = async (fileStream: Readable, outputPath: string): Promise<void> => {
  return await pipeline(fileStream, zlib.createGunzip(), fs.createWriteStream(outputPath))
}

/**
 * Extracts a specific file from a zip stream and returns it as a buffer.
 * Memory-efficient as it processes the zip entry by entry without loading the entire zip.
 *
 * @param zipStream The zip file as a readable stream.
 * @param fileName The name of the file to extract (can include path or glob patterns like "*.db").
 * @returns A buffer containing the file contents.
 */
export const extractFileFromZip = async (
  zipStream: Readable,
  fileName: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let fileFound = false

    zipStream
      .pipe(unzipper.Parse())
      .on('entry', (entry: Entry) => {
        if (matchesPattern(entry.path, fileName)) {
          fileFound = true

          entry.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })

          entry.on('end', () => {
            resolve(Buffer.concat(chunks))
          })

          entry.on('error', reject)
        } else {
          entry.autodrain()
        }
      })
      .on('error', reject)
      .on('finish', () => {
        if (!fileFound || chunks.length === 0) {
          reject(new Error(`File matching pattern "${fileName}" not found in zip`))
        } else resolve(Buffer.concat(chunks))
      })
  })
}

/**
 * Extracts multiple files from a zip stream.
 * Memory-efficient as it processes the zip entry by entry.
 *
 * @param zipStream The zip file as a readable stream.
 * @param fileNames Array of file names or patterns to extract (supports glob patterns like "*.db").
 * @returns A map of actual file paths to their contents (as buffers).
 */
export const extractFilesFromZip = async (
  zipStream: Readable,
  fileNames: string[]
): Promise<Map<string, Buffer>> => {
  return new Promise((resolve, reject) => {
    const files = new Map<string, Buffer>()
    const foundFiles = new Map<string, Buffer[]>()

    zipStream
      .pipe(unzipper.Parse())
      .on('entry', (entry: Entry) => {
        const entryPath = entry.path
        const matchedPattern = fileNames.find((pattern) => matchesPattern(entryPath, pattern))

        if (matchedPattern) {
          const chunks: Buffer[] = []
          foundFiles.set(entryPath, chunks)

          entry.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })

          entry.on('end', () => {
            files.set(entryPath, Buffer.concat(chunks))
          })

          entry.on('error', reject)
        } else {
          entry.autodrain()
        }
      })
      .on('error', reject)
      .on('finish', () => {
        resolve(files)
      })
  })
}

/**
 * Extracts a file from a nested zip (a zip within a zip).
 * First extracts the inner zip from the outer zip, then extracts the target file from the inner zip.
 *
 * @param outerZipStream The outer zip file as a readable stream.
 * @param innerZipName The name of the inner zip file within the outer zip.
 * @param targetFileName The name of the file to extract from the inner zip.
 * @param outputPath The path where the extracted file should be saved.
 * @returns A promise that resolves when the extraction is complete.
 */
export const extractFromNestedZip = async (
  outerZipStream: Readable,
  innerZipName: string,
  targetFileName: string,
  outputPath: string
): Promise<void> => {
  // Extract the inner zip file from the outer zip
  const innerZipBuffer = await extractFileFromZip(outerZipStream, innerZipName)

  // Create a readable stream from the inner zip buffer
  const innerZipStream = Readable.from(innerZipBuffer)

  // Extract the target file from the inner zip
  const fileBuffer = await extractFileFromZip(innerZipStream, targetFileName)
  await saveBufferToFile(fileBuffer, outputPath)
}

/**
 * Saves a buffer to a file, creating parent directories if they don't exist.
 *
 * @param buffer The buffer to save.
 * @param outputPath The path where the file should be saved.
 */
const saveBufferToFile = async (buffer: Buffer, outputPath: string): Promise<void> => {
  const dir = dirname(outputPath)
  await mkdir(dir, { recursive: true })
  await writeFile(outputPath, buffer)
}
