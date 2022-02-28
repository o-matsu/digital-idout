const initialState = () => ({
  metas: [],
  regions: [],
  focusedRegion: null,
})

export const state = () => Object.assign({}, initialState())
export const getters = {
  regions: (state) => state.regions,
  metas: (state) => state.metas,
  getMetaById: (state) => id => state.metas.find(meta => meta.id === id)
}
export const mutations = {
  SET_REGIONS: (state, regions) => {
    state.regions = regions
  },
  SET_METAS: (state, metas) => {
    state.metas = metas
  },
  SET_FOCUS: (state, regionId) => {
    state.focusedRegion = state.regions.find(region => region.id === regionId)
  }
}
export const actions = {
  async fetchRoleRegions() {
    // TODO: ログイン機能実装後、ロールの検索条件を加える
    const regions = []
    const regionDocs = await this.$fire.firestore.collection('regions').get()
    regionDocs.forEach(doc => {
      regions.push({ id: doc.id, data: doc.data() })
    })
    return regions
  },
  async loadRoleRegions({ commit, dispatch }) {
    const regions = await dispatch('fetchRoleRegions')
    commit('SET_REGIONS', regions)
  },
  async fetchMetasByRegion(_, regionId) {
    const metas = []
    const metaDocs = await this.$fire.firestore.collection('metas')
      .where('regionId', '==', regionId).get()
    metaDocs.forEach(doc => {
      metas.push({ id: doc.id, data: doc.data() })
    })
    return metas
  },
  async loadMetasByRegion({ commit, dispatch }, regionId) {
    const metas = await dispatch('fetchMetasByRegion', regionId)
    commit('SET_METAS', metas)
    commit('SET_FOCUS', regionId)
  },
  async register({ dispatch }, { points, meta, files }) {
    const regionId = await dispatch('insertRegion', { points })
    const metaId = await dispatch('insertMeta', { regionId, meta, files })
    dispatch('loadRoleRegions')
    return { regionId, metaId }
  },
  async insertRegion(_, { points }) {
    points = points.map(p => ({ x: p.x, y: p.y, z: p.z }))
    const data = {
      hasRoles: {
        GENERAL: false,
        EXPERT: false,
        PROJECT: false,
      },
      points,
    }
    console.log("🚀 ~ file: firebase.js ~ line 65 ~ insertRegion ~ data", data)
    try {
      const regionRef = await this.$fire.firestore.collection('regions').add(data)
      return regionRef.id
    } catch(e) {
      console.error(e)
    }
  },
  async insertMeta(_, { regionId, meta, files }) {
    const filePaths = []
    try {
      await Promise.all(files.map(async (file) => {
        const storegeRef = this.$fire.storage.ref('data/' + file.name)
        await storegeRef.put(file)
        const path = await storegeRef.getDownloadURL()
        filePaths.push(path)
      }))

      const metaDoc = await this.$fire.firestore.collection('metas').add({
        // TODO: add after deploy authentication
        authorId: null,
        title: meta.title,
        targetRole: meta.target,
        comment: meta.comment,
        regionId,
        files: files.map((file, i) => ({ name: file.name, type: file.type, src: filePaths[i] })),
        createdAt: this.$fireModule.firestore.Timestamp.now(),
      })

      const regionRef = this.$fire.firestore.collection('regions').doc(regionId)
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
      return metaDoc.id
  } catch(e) {
      console.error(e)
    }
  },
}
