// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt().prepend({
  ignores: [
    'app/components/three/js/',
    'components/three/js/',
  ],
})
