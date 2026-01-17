<template>
  <section class="artwork">
    <canvas ref="canvas" class="artwork__canvas" />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import EventBus from '~/utils/EventBus'

export default {
  components: {},
  props: [],
  data() {
    // 基本的にはここにthree.jsのオブジェクトを追加しない。
    return {}
  },
  computed: {
    ...mapGetters({
      regions: 'firebase/regions',
    }),
  },
  watch: {
    regions(val) {
      EventBus.$emit('DRAW_REGIONS', val)
    },
  },
  async mounted() {
    // Dynamic import for Three.js to avoid build issues
    if (import.meta.client) {
      try {
        const ThreeBrainModule = await import('./js/ThreeBrain')
        const ThreeBrain = ThreeBrainModule.default
        // canvas要素を渡す。
        this.threeBrain = new ThreeBrain({
          $canvas: this.$refs.canvas,
        })
      } catch (error) {
        console.error('Failed to load ThreeBrain:', error)
      }
    }
  },
  unmounted() {
    // canvasを作ったり壊したりする前提の場合はここに処理停止する処理を書く（今回省略）。
  },
  methods: {
    // この中にthree.jsの処理をばりばり書かない。
  },
}
</script>

<style>
.artwork {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
