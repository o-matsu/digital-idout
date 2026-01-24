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
        <h1>Data Detail</h1>
        <v-btn
          icon
          :to="{
            name: 'region-region',
            params: { region: route.params.region }
          }"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>
    <div v-if="meta" class="d-flex flex-column ma-4">
      <v-chip size="small">
        {{ meta.data.targetRole }}
      </v-chip>
      <div class="text-h5 pt-0 d-inline-block">{{ meta.data.title }}</div>
      <div class="text-grey-lighten-5">
        <div>{{ getUserName(meta.data.authorId) }}</div>
        <div>{{ datetime }}</div>
      </div>
      <v-card class="pa-4" color="grey-darken-3">
        {{ meta.data.comment }}
      </v-card>
      <v-divider class="my-2" />
      <v-card
        v-for="(file, i) in meta.data.files"
        :key="i"
        :href="file.src"
        target="_blank"
        hover
        class="mb-2"
      >
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <div>
              <v-chip size="small" class="mt-4 ml-2">
                {{ file.type }}
              </v-chip>
            </div>
            <v-card-title
              class="text-h5 pt-0 d-inline-block text-truncate"
              v-text="file.name"
              style="max-width: 200px"
            ></v-card-title>
          </div>

          <v-avatar
            v-if="file.type.match(/image/)"
            class="ma-3"
            size="111"
            tile
          >
            <v-img :src="file.src"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </div>

    <template v-if="isAuthor" v-slot:append>
      <div class="pa-2">
        <v-btn block color="red" @click="deleteMeta">
          <v-icon>mdi-delete</v-icon>
          DELETE
        </v-btn>
      </div>
    </template>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useFirebaseStore } from '~/stores/firebase'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const firebaseStore = useFirebaseStore()
const authStore = useAuthStore()

const metaId = computed(() => route.params.meta as string)
const regionId = computed(() => route.params.region as string)

// Data
const dataViewerDrawer = ref(true)

// Replace asyncData with useAsyncData
await useAsyncData(`meta-${metaId.value}`, async () => {
  if (!firebaseStore.getMetaById(metaId.value)) {
    await firebaseStore.loadMetasByRegion(regionId.value, true)
    if (!firebaseStore.getMetaById(metaId.value)) {
      await navigateTo({ name: 'index' })
    }
  }
})

// Computed
const meta = computed(() => firebaseStore.getMetaById(metaId.value))
const getUserName = (id: string) => firebaseStore.getUserName(id)
const userId = computed(() => authStore.getId)

const datetime = computed(() => {
  if (!meta.value) return ''
  return format(meta.value.data.createdAt.toDate(), 'yyyy-MM-dd kk:mm')
})

const isAuthor = computed(() => {
  if (!meta.value) return false
  return meta.value.data.authorId === userId.value
})

// Watchers
watch(dataViewerDrawer, (val) => {
  if (!val) {
    router.push({ name: 'index' })
  }
})

// Methods
const deleteMeta = async () => {
  if (confirm('Are you sure you want to permanently delete this data?')) {
    if (meta.value) {
      await firebaseStore.deleteMeta(meta.value)
      router.push({ name: 'index' })
    }
  }
}
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
