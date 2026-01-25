<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <div>
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" @click="showRegions = !showRegions">
              <v-icon>{{ showRegions ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </v-btn>
          </template>
          <span>Switch view mode</span>
        </v-tooltip>
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              :disabled="!isAuth"
              v-bind="props"
              :to="{ name: 'register' }"
            >
              <v-icon>mdi-map-marker-plus</v-icon>
            </v-btn>
          </template>
          <span>Data registration</span>
        </v-tooltip>
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn icon disabled v-bind="props">
              <v-icon>mdi-layers-triple</v-icon>
            </v-btn>
          </template>
          <span>Layer mode</span>
        </v-tooltip>
      </div>
      <v-spacer />
      <v-btn v-if="!isAuth" text @click="signIn">Sign in</v-btn>
      <v-menu v-else offset-y>
        <template #activator="{ props }">
          <v-btn text v-bind="props">
            <v-chip label outlined size="x-small">{{ user.role }}</v-chip>
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
      <slot />
    </v-main>

    <ThreeCanvasFrame />
  </v-app>
</template>

<script setup lang="ts">
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { useAuthStore } from '~~/stores/auth'
import { useFirebaseStore } from '~~/stores/firebase'
import { useEventBus } from '~/composables/useEventBus'

const route = useRoute()
const authStore = useAuthStore()
const firebaseStore = useFirebaseStore()
const { emit } = useEventBus()
const auth = useFirebaseAuth()!

// Data
const clipped = ref(false)
const title = ref('Digital Idout')
const showRegions = ref(false)

// Computed
const isAuth = computed(() => authStore.isAuth)
const user = computed(() => authStore.getUser)

// Watchers
watch(
  () => route.name,
  (newVal, oldVal) => {
    if (newVal === 'register') {
      emit('TOGGLE_PICKING_MODE', true)
    }
    if (oldVal === 'register') {
      emit('TOGGLE_PICKING_MODE', false)
    }
  },
  { immediate: true }
)

watch(showRegions, (flag) => {
  emit('TOGGLE_REGIONS_VIEW', flag)
})

// Methods
const signIn = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    firebaseStore.resetStore()
  } catch {
    console.log('failed logout')
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>
