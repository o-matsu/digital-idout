<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <div>
        <v-tooltip bottom>
          <template v-if="!showRegions" #activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" @click="showRegions = true" v-on="on">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
          <template v-else #activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" @click="showRegions = false" v-on="on">
              <v-icon>mdi-eye-off</v-icon>
            </v-btn>
          </template>
          <span>Switch view mode</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              :disabled="!isAuth"
              v-bind="attrs"
              :to="{ name: 'register' }"
              v-on="on"
            >
              <v-icon>mdi-map-marker-plus</v-icon>
            </v-btn>
          </template>
          <span>Data registration</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn icon disabled v-bind="attrs" v-on="on">
              <v-icon>mdi-layers-triple</v-icon>
            </v-btn>
          </template>
          <span>Layer mode</span>
        </v-tooltip>
      </div>
      <v-spacer />
      <v-btn v-if="!isAuth" text @click="SignIn"> Sign in </v-btn>
      <v-menu v-else offset-y>
        <template #activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-chip label outlined x-small>{{ user.role }}</v-chip>
            <span>{{ user.name }}</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="signOut">
            <v-list-item-title>Sign out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <Nuxt />
    </v-main>

    <CanvasFrame />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import CanvasFrame from '~/components/three/CanvasFrame'
import EventBus from '~/utils/EventBus'
export default {
  name: 'DefaultLayout',
  components: {
    CanvasFrame,
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
  mounted() {},
  computed: {
    ...mapGetters({
      isAuth: 'auth/isAuth',
      user: 'auth/getUser',
    }),
  },
  watch: {
    // routeが変わるときにシーンを変えるなどなにか処理する
    '$route.name': {
      handler(newVal, oldVal) {
        if (newVal === 'register') {
          EventBus.$emit('TOGGLE_PICKING_MODE', true)
        }
        if (oldVal === 'register') {
          EventBus.$emit('TOGGLE_PICKING_MODE', false)
        }
      },
      deep: true,
      immediate: true,
    },
    showRegions(flag) {
      EventBus.$emit('TOGGLE_REGIONS_VIEW', flag)
    },
  },
  methods: {
    SignIn() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      this.$fire.auth.signInWithRedirect(provider)
    },
    async signOut() {
      try {
        await this.$fire.auth.signOut()
        this.$store.dispatch('firebase/resetStore')
      } catch {
        console.log('failed logout')
      }
    },
  },
}
</script>
