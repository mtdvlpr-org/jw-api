import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'a11y',
        'api',
        'auth',
        'build',
        'ci',
        'core',
        'deps',
        'docs',
        'events',
        'i18n',
        'people',
        'suggestions',
        'tests',
        'ui'
      ]
    ]
  }
}

export default Configuration
