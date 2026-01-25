// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Disable server-side rendering (matches Nuxt 2 config)
  ssr: false,

  // Modules
  modules: [
    '@pinia/nuxt',
    'vuetify-nuxt-module',
    '@vite-pwa/nuxt',
    'nuxt-vuefire',
    '@nuxt/eslint',
  ],

  // VueFire/Firebase configuration
  vuefire: {
    config: {
      apiKey: 'AIzaSyCGZvZDWyjJdJMM3yRjTwkUg3g19Hgq6rI',
      authDomain: 'digital-idout.firebaseapp.com',
      projectId: 'digital-idout',
      storageBucket: 'digital-idout.appspot.com',
      messagingSenderId: '397141445801',
      appId: '1:397141445801:web:42b864b54ab5f7fef36db8',
      measurementId: 'G-7TLVQPRJFF'
    },
    auth: {
      enabled: true,
      sessionCookie: false
    }
  },

  // Vuetify configuration
  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/variables.scss' }
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            colors: {
              primary: '#1976D2',
              secondary: '#FFA000',
              accent: '#616161',
              info: '#26A69A',
              warning: '#FFC107',
              error: '#FF3D00',
              success: '#69F0AE'
            }
          }
        }
      }
    }
  },

  // PWA configuration
  pwa: {
    manifest: {
      name: 'Digital Idout',
      short_name: 'Idout',
      lang: 'en'
    }
  },

  // App configuration (replaces head in Nuxt 2)
  app: {
    head: {
      titleTemplate: '%s - digital-idout',
      title: 'digital-idout',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Auto-import components
  components: true,

  // TypeScript configuration
  typescript: {
    strict: false,
    shim: false
  },

  // Compatibility date for Nuxt 4
  compatibilityDate: '2025-01-24'
})
