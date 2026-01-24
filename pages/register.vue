<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    :width="width"
    color="grey-darken-3"
  >
    <template v-slot:prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data registration</h1>
        <v-btn icon @click="jumpRoot">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper-vertical v-model="step" class="bg-grey-darken-3">
      <v-stepper-vertical-item
        :complete="step > 1"
        :value="1"
        title="Create new region"
      >
        <small class="text-grey">
          Point vertices of the region counterclockwise.
        </small>
        <template v-slot:actions>
          <span></span>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item
        :complete="step > 2"
        :value="2"
        title="Enter information"
      >
        <v-form ref="formRef" v-model="valid" lazy-validation>
          <v-text-field
            label="TITLE"
            v-model="meta.title"
            :rules="requiredRule"
          />
          <v-select
            :items="securityOptions"
            label="SECURITY"
            v-model="meta.target"
            :rules="requiredRule"
          ></v-select>
          <v-textarea
            label="DESCRIPTION"
            rows="3"
            v-model="meta.comment"
            :rules="requiredRule"
          />
        </v-form>
        <template v-slot:actions>
          <v-btn color="primary" @click="goThird" :disabled="!valid">
            Continue
          </v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item
        :complete="step > 3"
        :value="3"
        title="Upload data files"
      >
        <v-file-input
          chips
          multiple
          label="select files"
          accept="image/*, application/pdf"
          v-model="files"
        ></v-file-input>
        <template v-slot:actions>
          <v-btn color="primary" @click="submit">Submit</v-btn>
        </template>
      </v-stepper-vertical-item>
    </v-stepper-vertical>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~/stores/firebase'
import { useEventBus } from '~/composables/useEventBus'

// Middleware
definePageMeta({
  middleware: ['authenticated']
})

const router = useRouter()
const firebaseStore = useFirebaseStore()
const { on, off } = useEventBus()

// Template ref for form
const formRef = ref<any>(null)

// Data
const drawer = ref(true)
const width = ref(256)
const step = ref(1)
const securityOptions = [
  { title: 'GENERAL', value: 'GENERAL' },
  { title: 'EXPERT', value: 'EXPERT' },
  { title: 'PROJECT', value: 'PROJECT' }
]
const points = ref<Array<{ x: number; y: number; z: number }>>([])
const valid = ref(false)
const meta = ref({
  title: '',
  target: null as string | null,
  comment: ''
})
const files = ref<File[]>([])
const requiredRule = [(v: any) => !!v || 'required']

// Watchers
watch(step, (val) => {
  if (val > 1) {
    width.value = 512
  }
})

// Event handlers
const goSecond = (pointArray: Array<{ x: number; y: number; z: number }>) => {
  step.value = 2
  points.value = pointArray
}

// Lifecycle
onMounted(() => {
  on('REGISTER_SECOND_STEP', goSecond)
})

onUnmounted(() => {
  off('REGISTER_SECOND_STEP', goSecond)
})

// Methods
const jumpRoot = () => {
  drawer.value = false
  router.push({ name: 'index' })
}

const goThird = async () => {
  const { valid } = await formRef.value?.validate() || { valid: false }
  if (valid) {
    step.value = 3
  }
}

const submit = async () => {
  const { regionId, metaId } = await firebaseStore.register(
    points.value,
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
      region: regionId,
      meta: metaId
    }
  })
}
</script>

