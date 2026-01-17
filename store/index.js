import { createStore } from 'vuex'
import auth from './auth'
import firebase from './firebase'

export default createStore({
  modules: {
    auth,
    firebase,
  },
})
