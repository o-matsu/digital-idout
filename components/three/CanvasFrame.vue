<template>
  <section class="artwork">
    <canvas class="artwork__canvas" ref="canvas"></canvas>
  </section>
</template>

<script>
import ThreeBrain from './js/ThreeBrain'

export default {
  components: {},
  props: [],
  data() {
    // 基本的にはここにthree.jsのオブジェクトを追加しない。
    return {}
  },
  computed: {},
  mounted() {
    // canvas要素を渡す。
    this.threeBrain = new ThreeBrain({
      $canvas: this.$refs.canvas,
    })
  },
  destroyed() {
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
}
</style>
