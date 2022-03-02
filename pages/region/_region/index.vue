<template>
  <v-navigation-drawer
    v-model="dataViewerDrawer"
    absolute
    temporary
    right
    :width='360'
  >
    <template v-slot:prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data list</h1>
        <v-btn icon @click="dataViewerDrawer = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-row class="pa-2">
      <v-col v-for='(meta, i) in metas' :key='i' cols='12'>
        <meta-card :data='meta.data' :id='meta.id' />
      </v-col>
    </v-row>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block :disabled='!isAuth' :to="{ name: 'region-region-meta-add', params: { region: $route.params.region } }">
          <v-icon>mdi-plus</v-icon>
          Add data
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'RegionId',
  async asyncData({ store, params, redirect }) {
    await store.dispatch('firebase/loadMetasByRegion', { regionId: params.region, force: false })
    if(!store.getters['firebase/getMetasByRegion'](params.region)) {
      redirect({ name: 'index' })
    }
  },
  data() {
    return {
      dataViewerDrawer: true,
    }
  },
  computed: {
    ...mapGetters({
      getMetasByRegion: 'firebase/getMetasByRegion',
      isAuth: 'auth/isAuth',
    }),
    metas () {
      return this.getMetasByRegion(this.$route.params.region)
    },
  },
  watch: {
    dataViewerDrawer(val) {
      if (!val) {
        this.$nuxt.context.redirect({ name: 'index' })
      }
    },
  },
}
</script>

<style>

</style>
