<template>
  <v-card
    dark
    hover
    :to="{
      name: 'region-region-meta-meta',
      params: { region: route.params.region, meta: id }
    }"
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <div>
          <v-chip size="small" class="mt-4 ml-2">
            {{ data.targetRole }}
          </v-chip>
        </div>
        <v-card-title
          class="text-h5 pt-0 d-inline-block text-truncate"
          v-text="data.title"
          style="max-width: 200px"
        ></v-card-title>
        <v-card-subtitle class="text-grey-lighten-5 mb-4">
          <div class="text-truncate" style="max-width: 200px">
            {{ getUserName(data.authorId) }}
          </div>
          <div>{{ datetime }}</div>
        </v-card-subtitle>
      </div>

      <v-avatar v-if="data.files.length" class="ma-3" size="111" tile>
        <v-img :src="data.files[0].src"></v-img>
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useFirebaseStore } from '~~/stores/firebase'

interface MetaData {
  targetRole: string
  title: string
  authorId: string
  createdAt: { toDate: () => Date }
  files: Array<{ src: string }>
}

const props = defineProps<{
  id: string
  data: MetaData
}>()

const route = useRoute()
const firebaseStore = useFirebaseStore()

const getUserName = (id: string) => firebaseStore.getUserName(id)

const datetime = computed(() => {
  return format(props.data.createdAt.toDate(), 'yyyy-MM-dd kk:mm')
})
</script>
