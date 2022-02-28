<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <div>
        <v-tooltip bottom>
          <template v-if="!showRegions" v-slot:activator="{ on, attrs }">
            <v-btn icon @click='showRegions = true' v-bind="attrs" v-on="on">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
          <template v-else v-slot:activator="{ on, attrs }">
            <v-btn icon @click='showRegions = false' v-bind="attrs" v-on="on">
              <v-icon>mdi-eye-off</v-icon>
            </v-btn>
          </template>
          <span>Switch view mode</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" :to="{ name: 'register' }">
              <v-icon>mdi-map-marker-plus</v-icon>
            </v-btn>
          </template>
          <span>Data registration</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon disabled v-bind="attrs" v-on="on">
              <v-icon>mdi-layers-triple</v-icon>
            </v-btn>
          </template>
          <span>Layer mode</span>
        </v-tooltip>
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
  mounted(){
    // イベント登録
    EventBus.$on("PICK_REGIONS", this.pickRegions);
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
    // routeが変わるときにシーンを変えるなどなにか処理する
    '$route.name': {
      handler(newVal, oldVal) {
        if (newVal === 'register') {
          EventBus.$emit("TOGGLE_PICKING_MODE", true)
        }
        if (oldVal === 'register') {
          EventBus.$emit("TOGGLE_PICKING_MODE", false)
        }
      },
      deep: true,
      immediate: true,
    },
    showRegions(flag) {
      EventBus.$emit("TOGGLE_REGIONS_VIEW", flag)
    },
  },
  methods: {
    pickRegions(targets) {
      this.$router.push({ name: 'region-region', params: { region: targets[0].object.name }})
    }
  },
}
</script>
