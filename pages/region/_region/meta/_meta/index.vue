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
          Data Detail
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider />
    <div class="d-flex flex-column ma-4">
      <v-chip small>
        {{ meta.data.targetRole }}
      </v-chip>
      <div
        class="text-h5 pt-0 d-inline-block text-truncate"
        v-text="meta.data.title"
        style="max-width: 200px;"
      ></div>
      <div class="grey--text text-lighten-5">
        <div>{{ meta.data.authorId }}</div>
        <div>{{ datetime }}</div>
      </div>
      <v-card class="pa-4" color='grey'>
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


    <template v-slot:append>
      <div class="pa-2">
        <v-btn block :to="{ name: 'region-region', params: { region: $route.params.region } }">
          <v-icon>mdi-arrow-left</v-icon>
          Back
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
  asyncData({ store, params }) {
  },
  data() {
    return {
      dataViewerDrawer: true,
    }
  },
  computed: {
    ...mapGetters({
      getMetaById: 'firebase/getMetaById'
    }),
    meta () {
      return this.getMetaById(this.$route.params.meta)
    },
    datetime() {
      return format(this.meta.data.createdAt.toDate(), 'yyyy-MM-dd kk:mm')
    },
  },
  watch: {
    dataViewerDrawer(val) {
      if (!val) {
        this.$router.push({ name: 'index' })
      }
    },
  },
}
</script>

<style>

</style>
