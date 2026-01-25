<template>
  <v-row/>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~~/stores/firebase'
import { useEventBus } from '~/composables/useEventBus'

const router = useRouter()
const firebaseStore = useFirebaseStore()
const { on, off } = useEventBus()

// Replace asyncData with useAsyncData
await useAsyncData('regions', () => firebaseStore.loadRoleRegions())

// Event handling
const pickRegions = (targets: Array<{ object: { name: string } }>) => {
  router.push({
    name: 'region-region',
    params: { region: targets[0].object.name }
  })
}

// Lifecycle hooks
onMounted(() => {
  on('PICK_REGIONS', pickRegions)
})

onUnmounted(() => {
  off('PICK_REGIONS', pickRegions)
})
</script>
