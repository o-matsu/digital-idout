<template>
  <v-row justify="center" align="center">
    <CanvasFrame />
  </v-row>
</template>

<script>
import CanvasFrame from '~/components/three/CanvasFrame'
export default {
  name: 'IndexPage',
  components: {
    CanvasFrame
  },
}
</script>
