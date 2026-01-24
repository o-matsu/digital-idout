<template>
  <v-navigation-drawer
    v-model="dataViewerDrawer"
    absolute
    temporary
    location="right"
    :width="360"
    color="grey-darken-3"
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

    <v-row class="pa-4">
      <v-col v-for="(meta, i) in metas" :key="i" cols="12">
        <MetaCard :data="meta.data" :id="meta.id" />
      </v-col>
    </v-row>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          :disabled="!isAuth"
          :to="{
            name: 'region-region-meta-add',
            params: { region: route.params.region }
          }"
        >
          <v-icon>mdi-plus</v-icon>
          Add data
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~/stores/firebase'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const firebaseStore = useFirebaseStore()
const authStore = useAuthStore()

const regionId = computed(() => route.params.region as string)

// Data
const dataViewerDrawer = ref(true)

// Replace asyncData with useAsyncData
const { data } = await useAsyncData(
  `region-${regionId.value}`,
  async () => {
    await firebaseStore.loadMetasByRegion(regionId.value, false)
    const metas = firebaseStore.getMetasByRegion(regionId.value)
    if (!metas || metas.length === 0) {
      // Check if region exists but has no metas (valid case) vs invalid region
      return { valid: true }
    }
    return { valid: true }
  }
)

// Computed
const isAuth = computed(() => authStore.isAuth)
const metas = computed(() => firebaseStore.getMetasByRegion(regionId.value))

// Watchers
watch(dataViewerDrawer, (val) => {
  if (!val) {
    navigateTo({ name: 'index' })
  }
})
</script>
