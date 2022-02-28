<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <div>
        <template v-if="!showRegions">
          <v-btn icon @click='showRegions = true'>
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-btn icon @click='showRegions = false'>
            <v-icon>mdi-eye-off</v-icon>
          </v-btn>
        </template>
        <v-btn icon>
          <v-icon>mdi-map-marker-plus</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-layers-triple</v-icon>
        </v-btn>
      </div>
      <v-spacer />
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Nuxt />
    </v-main>

    <CanvasFrame />
  </v-app>
</template>

<script>
import CanvasFrame from '~/components/three/CanvasFrame'
import EventBus from '~/utils/EventBus'
export default {
  name: 'DefaultLayout',
  components: {
    CanvasFrame
  },
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Digital Idout',
      showRegions: false,
    }
  },
  watch: {
    showRegions(flag) {
      EventBus.$emit("TOGGLE_REGIONS_VIEW", flag)
    },
  },
}
</script>
