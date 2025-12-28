import { defineVitestProject } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: 'node',
          include: ['test/e2e/*.test.ts'],
          name: 'e2e'
        }
      },
      {
        test: {
          environment: 'happy-dom',
          include: ['test/unit/{app,shared}/**/*.test.ts'],
          name: 'browser'
        }
      },
      {
        test: {
          alias: {
            '#server': fileURLToPath(new URL('./server', import.meta.url))
          },
          environment: 'node',
          include: ['test/unit/{server,shared}/**/*.test.ts'],
          name: 'server'
        }
      },
      await defineVitestProject({
        test: {
          environment: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          name: 'nuxt'
        }
      })
    ]
  }
})
