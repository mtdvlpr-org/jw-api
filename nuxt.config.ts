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
    experimental: { openAPI: true },
    openAPI: {
      meta: { description, title: 'JW API', version },
      production: 'prerender',
      ui: { scalar: { telemetry: false } }
    }
  },
  routeRules: { '/api/**': { cors: true }, '/mcp': { cors: true } },
  runtimeConfig: { public: { version } }
})
