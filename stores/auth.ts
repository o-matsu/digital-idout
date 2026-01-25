import { defineStore } from 'pinia'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

interface AuthUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: string
}

interface AuthState {
  authUser: AuthUser
}

const initialState = (): AuthState => ({
  authUser: {
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
    role: ''
  }
})

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ ...initialState() }),

  getters: {
    getId: (state): string => state.authUser.uid,
    isAuth: (state): boolean => state.authUser.uid !== '',
    getUser: (state) => ({
      name: state.authUser.displayName,
      role: state.authUser.role
    })
  },

  actions: {
    resetStore() {
      Object.assign(this.$state, initialState())
    },

    setAuthUser(authUser: { uid: string; email: string; photoURL: string }) {
      this.authUser.uid = authUser.uid
      this.authUser.email = authUser.email
      this.authUser.photoURL = authUser.photoURL
    },

    setStoreUser(storeUser: { displayName: string; role: string }) {
      this.authUser.displayName = storeUser.displayName
      this.authUser.role = storeUser.role
    },

    async onAuthStateChanged(authUser: { uid: string; email: string; displayName: string; photoURL: string; getIdToken?: () => Promise<string> } | null) {
      // リージョン再読み込み用にfirebaseStoreをインポート
      const { useFirebaseStore } = await import('./firebase')
      const firebaseStore = useFirebaseStore()

      if (!authUser) {
        this.resetStore()
        // ログアウト時もリージョンを再読み込み（GENERALのみ表示）
        await firebaseStore.loadRoleRegions()
        return
      }

      if (authUser && authUser.getIdToken) {
        try {
          const db = getFirestore()
          const userDocRef = doc(db, 'users', authUser.uid)
          const userDoc = await getDoc(userDocRef)

          let storeUser = null
          if (!userDoc.exists()) {
            // Firestore にユーザー用のドキュメントが作られていなければ作る
            storeUser = {
              userId: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              createdAt: serverTimestamp(),
              role: 'GENERAL'
            }
            await setDoc(userDocRef, storeUser)
          } else {
            storeUser = userDoc.data()
          }

          this.setStoreUser(storeUser as { displayName: string; role: string })
          this.setAuthUser(authUser)

          // ログイン後にリージョンを再読み込み（ユーザーのroleに基づく）
          console.log('Auth state changed, reloading regions for role:', storeUser?.role)
          await firebaseStore.loadRoleRegions()
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
})
