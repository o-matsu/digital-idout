const initialState = () => ({
  authUser: {
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
    role: '',
  },
})

export const state = () => Object.assign({}, initialState())
export const getters = {
  getId: (state) => {
    return state.authUser.uid
  },
  isAuth: (state) => {
    return state.authUser.uid !== ''
  },
  getUser: (state) => {
    return { name: state.authUser.displayName, role: state.authUser.role }
  }
}
export const mutations = {
  RESET_STORE: (state) => {
    Object.assign(state, initialState())
  },
  SET_AUTH_USER: (state, { authUser }) => {
    state.authUser.uid = authUser.uid
    state.authUser.email = authUser.email
    state.authUser.photoURL = authUser.photoURL
  },
  SET_STORE_USER: (state, { storeUser }) => {
    state.authUser.displayName = storeUser.displayName
    state.authUser.role = storeUser.role
  },
}
export const actions = {
  async onAuthStateChanged({ commit }, { authUser }) {
    if (!authUser) {
      commit('RESET_STORE')
      return
    }
    if (authUser && authUser.getIdToken) {
      try {
        const userDoc = await this.$fire.firestore
          .collection('users')
          .doc(authUser.uid)
          .get()
        let storeUser = null
        if (!userDoc.exists) {
          // Firestore にユーザー用のドキュメントが作られていなければ作る
          storeUser = {
            userId: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
            role: 'GENERAL',
          }
          await userDoc.ref.set(storeUser)
        } else {
          storeUser = userDoc.data()
        }
        commit('SET_STORE_USER', { storeUser })
        commit('SET_AUTH_USER', { authUser })
      } catch (e) {
        console.error(e)
      }
    }
  },
}

