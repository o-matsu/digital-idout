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
    // ThreeBrain初期化後に既存のリージョンを描画
    if (regions.value && regions.value.length > 0) {
      console.log('CanvasFrame: drawing initial regions after ThreeBrain init', regions.value)
      emit('DRAW_REGIONS', regions.value)
    }
  }
})

onUnmounted(() => {
  // Cleanup if needed
  threeBrain = null
})

// Watchers - リージョンが変更されたら描画（ただしThreeBrain初期化後のみ）
watch(regions, (val) => {
  if (threeBrain && val && val.length > 0) {
    console.log('CanvasFrame: regions changed, emitting DRAW_REGIONS', val)
    emit('DRAW_REGIONS', val)
  }
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
