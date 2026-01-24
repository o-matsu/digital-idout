<template>
  <div>
    <div
      v-if="dataViewerDrawer"
      class="drawer-backdrop"
      @click="dataViewerDrawer = false"
    ></div>
    <v-navigation-drawer
      v-model="dataViewerDrawer"
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
  </div>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~~/stores/firebase'
import { useAuthStore } from '~~/stores/auth'

const route = useRoute()
const firebaseStore = useFirebaseStore()
const authStore = useAuthStore()

const regionId = computed(() => route.params.region as string)

// Data
const dataViewerDrawer = ref(true)

// Load metas function
const loadMetas = async () => {
  // Ensure regions are loaded first (for direct URL access)
  if (firebaseStore.getRegions.length === 0) {
    await firebaseStore.loadRoleRegions()
  }
  // Force reload to get metas with current auth role
  await firebaseStore.loadMetasByRegion(regionId.value, true)
}

// Watch auth state changes to reload metas with correct permissions
watch(
  () => authStore.isAuth,
  async () => {
    await loadMetas()
  }
)

// Initial load
onMounted(async () => {
  await loadMetas()
})

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

<style scoped>
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
</style>
