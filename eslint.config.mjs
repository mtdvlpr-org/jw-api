import vitest from '@vitest/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import security from 'eslint-plugin-security'

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Plugins
  security.configs.recommended,
  perfectionist.configs['recommended-natural'],

  // General rules
  { rules: { 'no-console': ['error'] } },

  // Vue specific rules
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['warn'],
      'vue/define-emits-declaration': ['error'],
      'vue/define-macros-order': ['warn'],
      'vue/define-props-declaration': ['error'],
      'vue/dot-notation': ['warn'],
      'vue/no-empty-component-block': ['error'],
      'vue/no-unused-emit-declarations': ['error'],
      'vue/no-useless-mustaches': ['warn'],
      'vue/no-useless-v-bind': ['warn'],
      'vue/prefer-define-options': ['warn'],
      'vue/prefer-template': ['warn']
    }
  },

  // Test files
  { files: ['test/**'], plugins: { vitest }, rules: { ...vitest.configs.recommended.rules } },

  // Prettier
  eslintPluginPrettierRecommended,
  { rules: { 'prettier/prettier': ['error', { endOfLine: 'auto' }] } }
).overrideRules({
  'security/detect-object-injection': 'off',
  'vue/attributes-order': ['warn', { alphabetical: true, sortLineLength: true }],
  'vue/block-order': ['error', { order: ['template', 'script', 'style'] }]
})
