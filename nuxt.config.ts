import { fileURLToPath } from 'node:url'

import type { DbKey } from './shared/types/db'

import { description, version } from './package.json'

const title = 'JW API'

const database: Record<DbKey, { connector: 'sqlite'; options: { name: DbKey } }> = {
  catalog: { connector: 'sqlite', options: { name: 'catalog' } }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: { '#server': fileURLToPath(new URL('./server', import.meta.url)) },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { typescriptBundlerResolution: true },
  mcp: { name: title, version },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/mcp-toolkit'],
  nitro: {
    database,
    experimental: { database: true, openAPI: true },
    openAPI: {
      meta: { description, title, version },
      production: 'prerender',
      ui: { scalar: { telemetry: false } }
    },
    storage: {
      db: { base: './.data/db', driver: 'fs-lite' },
      temp: { base: './.data/temp', driver: 'fs-lite' }
    }
  },
  routeRules: { '/api/**': { cors: true }, '/mcp': { cors: true } },
  runtimeConfig: { public: { description, title, version } }
})
