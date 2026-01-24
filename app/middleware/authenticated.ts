import { useAuthStore } from '~~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // 未認証ユーザーはindexへリダイレクト
  if (!authStore.authUser.uid) {
    return navigateTo('/')
  }
})
