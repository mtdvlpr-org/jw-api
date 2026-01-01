import { fileURLToPath } from 'node:url'

import { description, version } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: { '#server': fileURLToPath(new URL('./server', import.meta.url)) },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { typescriptBundlerResolution: true },
  mcp: { name: 'JW MCP', version },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/mcp-toolkit'],
  nitro: {
    database: {
      catalog: { connector: 'sqlite', options: { name: 'catalog' } },
      jwpub: { connector: 'sqlite', options: { name: 'jwpub' } },
      mwb: { connector: 'sqlite', options: { name: 'mwb' } },
      wt: { connector: 'sqlite', options: { name: 'wt' } }
    },
    experimental: { database: true, openAPI: true },
    openAPI: {
      meta: { description, title: 'JW API', version },
      production: 'prerender',
      ui: { scalar: { telemetry: false } }
    },
    storage: {
      db: { base: './.data/db', driver: 'fs-lite' },
      temp: { base: './.data/temp', driver: 'fs-lite' }
    }
  },
  routeRules: { '/api/**': { cors: true }, '/mcp': { cors: true } },
  runtimeConfig: { public: { version } }
})
