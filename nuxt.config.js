// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Disable server-side rendering
  ssr: false,

  // Nuxt 4 compatibility
  future: {
    compatibilityVersion: 4,
  },

  // Global page metadata
  app: {
    head: {
      titleTemplate: '%s - digital-idout',
      title: 'digital-idout',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Global CSS
  css: ['vuetify/styles'],

  // Modules
  modules: ['@pinia/nuxt', 'nuxt-vuefire'],

  // Vite plugins
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    optimizeDeps: {
      exclude: ['components/three/js'],
    },
    build: {
      rollupOptions: {
        external: [/components\/three\/js/],
      },
    },
  },

  // VueFire configuration
  vuefire: {
    config: {
      apiKey: 'AIzaSyCGZvZDWyjJdJMM3yRjTwkUg3g19Hgq6rI',
      authDomain: 'digital-idout.firebaseapp.com',
      projectId: 'digital-idout',
      storageBucket: 'digital-idout.appspot.com',
      messagingSenderId: '397141445801',
      appId: '1:397141445801:web:42b864b54ab5f7fef36db8',
      measurementId: 'G-7TLVQPRJFF',
    },
    auth: {
      enabled: true,
    },
  },

  // Auto import components
  components: true,

  // Build Configuration
  build: {
    transpile: ['vuetify'],
  },

  devtools: { enabled: true },

  compatibilityDate: '2026-01-16',
})
