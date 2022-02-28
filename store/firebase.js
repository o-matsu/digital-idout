const initialState = () => ({
  metas: [],
  regions: [],
  focusedRegion: null,
})

export const state = () => Object.assign({}, initialState())
export const getters = {
  regions: (state) => state.regions,
  metas: (state) => state.metas,
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
}
