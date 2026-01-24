import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const auth = getAuth()

  onAuthStateChanged(auth, async (user) => {
    await authStore.onAuthStateChanged(user)
  })
})
