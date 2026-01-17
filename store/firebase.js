const initialState = () => ({
  metas: [],
  regions: [],
  users: [],
})
const roleLevel = ['GENERAL', 'EXPERT', 'PROJECT']

// Helper to get Firebase instances (will be injected by plugin)
let $fire = null
let $fireModule = null

export function setFirebase(fire, fireModule) {
  $fire = fire
  $fireModule = fireModule
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    regions: (state) => state.regions,
    getMetasByRegion: (state) => (regionId) =>
      state.metas.filter((meta) => meta.data.regionId === regionId),
    getMetaById: (state) => (id) => state.metas.find((meta) => meta.id === id),
    getUserName: (state) => (id) =>
      state.users.find((user) => user.userId === id).displayName,
  },
  mutations: {
    RESET_STORE: (state) => {
      Object.assign(state, initialState())
    },
    SET_REGIONS: (state, regions) => {
      state.regions = regions
    },
    SET_METAS: (state, metas) => {
      state.metas.push(...metas)
    },
    RESET_METAS: (state, metas) => {
      state.metas = metas
    },
    SET_USER: (state, user) => {
      state.users.push(user)
    },
  },
  actions: {
    resetStore({ commit }) {
      commit('RESET_STORE')
    },
    async getRoleRegions(_, { regions, role }) {
      const regionDocs = await $fire.firestore
        .collection('regions')
        .where('hasRoles.' + role, '==', true)
        .get()
      regionDocs.forEach((doc) => {
        if (!regions.map((region) => region.id).includes(doc.id)) {
          regions.push({ id: doc.id, data: doc.data() })
        }
      })
      return regions
    },
    async fetchRoleRegions({ rootGetters, dispatch }) {
      const role = rootGetters['auth/isAuth']
        ? rootGetters['auth/getUser'].role
        : 'GENERAL'
      let regions = []
      for (let i = 0; i < roleLevel.indexOf(role) + 1; i++) {
        regions = await dispatch('getRoleRegions', {
          regions,
          role: roleLevel[i],
        })
      }
      return regions
    },
    async loadRoleRegions({ commit, dispatch }) {
      const regions = await dispatch('fetchRoleRegions')
      commit('SET_REGIONS', regions)
    },
    async fetchMetasByRegion({ rootGetters }, regionId) {
      const role = rootGetters['auth/isAuth']
        ? rootGetters['auth/getUser'].role
        : 'GENERAL'
      const target = roleLevel.slice(0, roleLevel.indexOf(role) + 1)
      const metas = []
      const metaDocs = await $fire.firestore
        .collection('metas')
        .where('regionId', '==', regionId)
        .where('targetRole', 'in', target)
        .get()
      metaDocs.forEach((doc) => {
        metas.push({ id: doc.id, data: doc.data() })
      })
      return metas
    },
    async loadMetasByRegion({ state, commit, dispatch }, { regionId, force }) {
      if (
        state.metas.some((meta) => meta.data.regionId === regionId) &&
        !force
      ) {
        return
      }
      const metas = await dispatch('fetchMetasByRegion', regionId)
      await dispatch('loadAuthors', metas)
      if (force) {
        commit('RESET_METAS', metas)
      } else {
        commit('SET_METAS', metas)
      }
    },
    async fetchAuthor(_, userId) {
      const userDoc = await $fire.firestore
        .collection('users')
        .doc(userId)
        .get()
      return userDoc.data()
    },
    async loadAuthors({ state, dispatch, commit }, metas) {
      const authorIds = [...new Set(metas.map((meta) => meta.data.authorId))]
      await Promise.all(
        authorIds.map(async (authorId) => {
          if (!state.users.map((user) => user.userId).includes(authorId)) {
            const user = await dispatch('fetchAuthor', authorId)
            commit('SET_USER', user)
          }
        }),
      )
    },
    async register({ dispatch }, { points, meta, files }) {
      const regionId = await dispatch('insertRegion', { points })
      const metaId = await dispatch('insertMeta', { regionId, meta, files })
      dispatch('loadRoleRegions')
      return { regionId, metaId }
    },
    async insertRegion(_, { points }) {
      points = points.map((p) => ({ x: p.x, y: p.y, z: p.z }))
      const data = {
        hasRoles: {
          GENERAL: false,
          EXPERT: false,
          PROJECT: false,
        },
        points,
      }
      try {
        const regionRef = await $fire.firestore.collection('regions').add(data)
        return regionRef.id
      } catch (e) {
        console.error(e)
      }
    },
    async insertMeta({ rootGetters, dispatch }, { regionId, meta, files }) {
      const filePaths = []
      try {
        // upload files to storage
        await Promise.all(
          files.map(async (file) => {
            const storageRef = $fire.storage.ref('data/' + file.name)
            await storageRef.put(file)
            const path = await storageRef.getDownloadURL()
            filePaths.push(path)
          }),
        )

        // insert record to firestore/metas
        const metaDoc = await $fire.firestore.collection('metas').add({
          authorId: rootGetters['auth/getId'],
          title: meta.title,
          targetRole: meta.target,
          comment: meta.comment,
          regionId,
          files: files.map((file, i) => ({
            name: file.name,
            type: file.type,
            src: filePaths[i],
          })),
          createdAt: $fireModule.firestore.Timestamp.now(),
        })

        // update record in firestore/regions
        const regionRef = $fire.firestore.collection('regions').doc(regionId)
        const regionDoc = await regionRef.get()
        const docData = regionDoc.data().hasRoles
        const data = {
          GENERAL: docData.GENERAL || meta.target === 'GENERAL',
          EXPERT: docData.EXPERT || meta.target === 'EXPERT',
          PROJECT: docData.PROJECT || meta.target === 'PROJECT',
        }
        regionRef.update({
          hasRoles: data,
        })

        await dispatch('loadMetasByRegion', { regionId, force: true })
        return metaDoc.id
      } catch (e) {
        console.error(e)
      }
    },
    async deleteMeta({ dispatch }, { meta }) {
      try {
        // delete file in storage
        await Promise.all(
          meta.data.files.map(async (file) => {
            await $fire.storage.ref('data/' + file.name).delete()
          }),
        )

        // delete record in firestore/metas
        await $fire.firestore.collection('metas').doc(meta.id).delete()

        // update record in firestore/regions
        const regionId = meta.data.regionId
        const deletedRole = meta.data.targetRole
        const hasRole = await $fire.firestore
          .collection('metas')
          .where('regionId', '==', regionId)
          .where('targetRole', '==', deletedRole)
          .get()
        if (hasRole.empty) {
          const regionRef = $fire.firestore.collection('regions').doc(regionId)
          const regionDoc = await regionRef.get()
          const docData = regionDoc.data().hasRoles
          const data = {
            GENERAL: deletedRole === 'GENERAL' ? false : docData.GENERAL,
            EXPERT: deletedRole === 'EXPERT' ? false : docData.EXPERT,
            PROJECT: deletedRole === 'PROJECT' ? false : docData.PROJECT,
          }
          regionRef.update({
            hasRoles: data,
          })
        }

        dispatch('resetStore')
      } catch (e) {
        console.error(e)
      }
    },
  },
}
