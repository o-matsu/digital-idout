import store from '~/store'
import { setFirebase as setFirebaseFirestore } from '~/store/firebase'
import { setFirebase as setFirebaseAuth } from '~/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Inject Firebase instances into store modules
  const $fire = nuxtApp.$fire
  const $fireModule = nuxtApp.$fireModule

  if ($fire && $fireModule) {
    setFirebaseFirestore($fire, $fireModule)
    setFirebaseAuth($fire, $fireModule)
  }

  nuxtApp.vueApp.use(store)

  return {
    provide: {
      store,
    },
  }
})
