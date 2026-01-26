import type { DbKey } from './shared/types/db'

import { description, version } from './package.json'

const title = 'JW API'
const isDev = import.meta.env.NODE_ENV === 'development'

const database: Record<DbKey, { connector: 'sqlite'; options: { name: DbKey } }> = {
  catalog: { connector: 'sqlite', options: { name: 'catalog' } }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ content: description, name: 'description' }],
      title
    }
  },
  compatibilityDate: '2025-07-15',
  future: { typescriptBundlerResolution: true },
  mcp: { name: title, version },
  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', '@nuxtjs/mcp-toolkit', 'nuxt-security'],
  nitro: {
    database,
    experimental: { database: true, openAPI: true },
    openAPI: {
      meta: { description, title, version },
      production: 'prerender',
      route: '/_docs/openapi.json',
      ui: {
        scalar: { route: '/_docs/scalar', telemetry: false },
        swagger: { route: '/_docs/swagger' }
      }
    },
    storage: {
      db: { base: './.data/db', driver: 'fs-lite' },
      temp: { base: './.data/temp', driver: 'fs-lite' }
    }
  },
  runtimeConfig: {
    apiVersion: 'v1',
    public: { description, title, version }
  },
  security: {
    corsHandler: { origin: '*' },
    csrf: false, // TODO: Enable CSRF protection when we have state-changing endpoints
    headers: {
      contentSecurityPolicy: {
        'frame-src': isDev ? ["'self'", 'data:'] : undefined, // Nuxt DevTools
        'img-src': isDev ? ["'self'", 'data:'] : undefined, // Nuxt DevTools
        'script-src-attr': isDev
          ? [
              "'unsafe-hashes'",
              "'sha256-7TqQJF3K4wrZpxSqn+IJ/s3Y705jL5IIk8Ga5HVJD1s='" // NuxtErrorPage
            ]
          : undefined,
        'script-src-elem': isDev ? ["'self'", "'unsafe-inline'"] : undefined,
        'style-src-attr': isDev
          ? ["'self'", "'unsafe-inline'"]
          : [
              "'unsafe-hashes'",
              "'sha256-V1oXad6TSON5lAPSlYyq7P4n6DHYMuK6mVMTl6g4Qnc='" // NuxtLoadingIndicator
            ],
        'style-src-elem': isDev
          ? [
              "'self'",
              "'unsafe-inline'"
              // "'unsafe-hashes'",
              // "'sha256-OD9WVNQJEovAiR/DJOt93obaRkfsvRKjjDXmxB2VR+w='", // Nuxt DevTools
              // TODO: Remove when NuxtWelcome is removed
              // "'sha256-xfTtFXgyQRFFrgZl3DoFKJBt5UsgD7QZ2l1JoWk3xCk='", // NuxtWelcome
              // "'sha256-zyQlNcK/TQ7fWXm/87qoWxHXLGBjDfqDj7AkcCt2weM='", // NuxtWelcome
            ]
          : undefined,
        'worker-src': isDev ? ["'self'", 'blob:'] : undefined // Nuxt DevTools
      }
    },
    rateLimiter: { headers: true },
    strict: true
  }
})
