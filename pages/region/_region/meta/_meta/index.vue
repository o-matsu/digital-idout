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
        <h1>Data Detail</h1>
        <v-btn icon :to="{ name: 'region-region', params: { region: $route.params.region } }">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>
    <div class="d-flex flex-column ma-4">
      <v-chip small>
        {{ meta.data.targetRole }}
      </v-chip>
      <div class="text-h5 pt-0 d-inline-block">{{ meta.data.title }}</div>
      <div class="grey--text text-lighten-5">
        <div>{{ getUserName(meta.data.authorId) }}</div>
        <div>{{ datetime }}</div>
      </div>
      <v-card class="pa-4" color='grey darken-3'>
        {{ meta.data.comment }}
      </v-card>
      <v-divider class="my-2"/>
      <v-card v-for='(file, i) in meta.data.files' :key='i' :href='file.src' target='_blank' hover>
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <div>
              <v-chip small class="mt-4 ml-2">
                {{ file.type }}
              </v-chip>
            </div>
            <v-card-title
              class="text-h5 pt-0 d-inline-block text-truncate"
              v-text="file.name"
              style="max-width: 200px;"
            ></v-card-title>
          </div>

          <v-avatar
            v-if='file.type.match(/image/)'
            class="ma-3"
            size="111"
            tile
          >
            <v-img :src="file.src"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </div>


    <template v-if='isAuthor' v-slot:append>
      <div class="pa-2">
        <v-btn block color="red" @click='deleteMeta'>
          <v-icon>mdi-delete</v-icon>
          DELETE
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { format } from 'date-fns'
import { mapGetters } from 'vuex'
export default {
  name: 'RegionMetaId',
  async asyncData({ store, params, redirect }) {
    if (!store.getters['firebase/getMetaById'](params.meta)) {
      await store.dispatch('firebase/loadMetasByRegion', { regionId: params.region, force: true })
      if(!store.getters['firebase/getMetaById'](params.meta)) {
        redirect({ name: 'index' })
      }
    }
  },
  data() {
    return {
      dataViewerDrawer: true,
    }
  },
  computed: {
    ...mapGetters({
      getMetaById: 'firebase/getMetaById',
      getUserName: 'firebase/getUserName',
      userId: 'auth/getId',
    }),
    meta () {
      return this.getMetaById(this.$route.params.meta)
    },
    datetime() {
      return format(this.meta.data.createdAt.toDate(), 'yyyy-MM-dd kk:mm')
    },
    isAuthor() {
      return this.meta.data.authorId === this.userId
    },
  },
  watch: {
    dataViewerDrawer(val) {
      if (!val) {
        this.$router.push({ name: 'index' })
      }
    },
  },
  methods: {
    async deleteMeta() {
      if (confirm("Are you sure you want to permanently delete this data?")) {
        await this.$store.dispatch('firebase/deleteMeta', { meta: this.meta })
        this.$router.push({ name: 'index' })
      }
    },
  }
}
</script>

<style>

</style>
