<template>
  <v-navigation-drawer
    v-model="dataViewerDrawer"
    absolute
    temporary
    right
    :width='360'
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="text-h6">
          Data list
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider />
    <v-row class="pa-2">
      <v-col v-for='(meta, i) in metas' :key='i' cols='12'>
        <meta-card :data='meta.data' :id='meta.id' />
      </v-col>
    </v-row>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block :to="{ name: 'region-region-meta-add', params: { region: $route.params.region } }">
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
  asyncData({ store, params }) {
    store.dispatch('firebase/loadMetasByRegion', params.region)
  },
  data() {
    return {
      dataViewerDrawer: true,
    }
  },
  computed: {
    ...mapGetters({
      metas: 'firebase/metas'
    })
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
