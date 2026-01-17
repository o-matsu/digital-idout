// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
  },
})
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-text-v-html-on-component': 'warn',
      'vue/order-in-components': 'warn',
    },
  })
  .override('nuxt/javascript', {
    rules: {
      'no-undef': 'off', // Nuxt auto-imports
    },
  })
  .append({
    ignores: ['components/three/**'],
  })
