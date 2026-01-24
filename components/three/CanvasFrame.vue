<template>
  <section class="artwork" @click="handleClick">
    <canvas class="artwork__canvas" ref="canvas"></canvas>
  </section>
</template>

<script setup lang="ts">
import ThreeBrain from './js/ThreeBrain'
import { useFirebaseStore } from '~/stores/firebase'
import { useEventBus } from '~/composables/useEventBus'

const firebaseStore = useFirebaseStore()
const { emit } = useEventBus()

const canvas = ref<HTMLCanvasElement | null>(null)
let threeBrain: ThreeBrain | null = null

// Computed
const regions = computed(() => firebaseStore.getRegions)

// Methods
const handleClick = (e: MouseEvent) => {
  emit('MOUSE_CLICK', e)
}

// Lifecycle
onMounted(() => {
  if (canvas.value) {
    threeBrain = new ThreeBrain({
      $canvas: canvas.value
    })
  }
})

onUnmounted(() => {
  // Cleanup if needed
  threeBrain = null
})

// Watchers
watch(regions, (val) => {
  emit('DRAW_REGIONS', val)
})
</script>

<style>
.artwork {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 0;
}

.artwork__canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
