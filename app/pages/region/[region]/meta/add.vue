<template>
  <div>
    <div
      v-if="drawer"
      class="drawer-backdrop"
      @click="jumpBack"
    />
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      :width="512"
      color="grey-darken-3"
    >
    <template #prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data Adding</h1>
        <v-btn icon @click="jumpBack">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper-vertical v-model="step" class="bg-grey-darken-3">
      <v-stepper-vertical-item
        :complete="step > 1"
        :value="1"
        title="Enter information"
      >
        <v-form ref="formRef" v-model="valid" lazy-validation>
          <v-text-field
            v-model="meta.title"
            label="TITLE"
            :rules="requiredRule"
          />
          <v-select
            v-model="meta.target"
            :items="securityOptions"
            label="SECURITY"
            :rules="requiredRule"
          />
          <v-textarea
            v-model="meta.comment"
            label="DESCRIPTION"
            rows="3"
            :rules="requiredRule"
          />
        </v-form>
        <template #actions>
          <v-btn color="primary" :disabled="!valid" @click="goSecond">
            Continue
          </v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item
        :complete="step > 2"
        :value="2"
        title="Upload data files"
      >
        <v-file-input
          v-model="files"
          chips
          multiple
          label="select files"
          accept="image/*, application/pdf"
        />
        <template #actions>
          <v-btn color="primary" @click="submit">Submit</v-btn>
        </template>
      </v-stepper-vertical-item>
    </v-stepper-vertical>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~~/stores/firebase'

// Middleware
definePageMeta({
  middleware: ['authenticated']
})

const route = useRoute()
const router = useRouter()
const firebaseStore = useFirebaseStore()

// Template ref for form
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

// Data
const drawer = ref(true)
const step = ref(1)
const securityOptions = [
  { title: 'GENERAL', value: 'GENERAL' },
  { title: 'EXPERT', value: 'EXPERT' },
  { title: 'PROJECT', value: 'PROJECT' }
]
const valid = ref(false)
const meta = ref({
  title: '',
  target: null as string | null,
  comment: ''
})
const files = ref<File[]>([])
const requiredRule = [(v: string | null) => !!v || 'required']

// Methods
const jumpBack = () => {
  drawer.value = false
  router.push({
    name: 'region-region',
    params: { region: route.params.region as string }
  })
}

const goSecond = async () => {
  const { valid } = await formRef.value?.validate() || { valid: false }
  if (valid) {
    step.value = 2
  }
}

const submit = async () => {
  const metaId = await firebaseStore.insertMeta(
    route.params.region as string,
    {
      title: meta.value.title,
      target: meta.value.target || '',
      comment: meta.value.comment
    },
    files.value
  )
  router.push({
    name: 'region-region-meta-meta',
    params: {
      region: route.params.region as string,
      meta: metaId
    }
  })
}
</script>

<style scoped>
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
</style>
