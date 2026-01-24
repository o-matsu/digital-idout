<template>
  <v-navigation-drawer v-model="drawer" absolute right permanent :width="512">
    <template v-slot:prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data Adding</h1>
        <v-btn icon @click="jumpBack">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-item
          :complete="step > 1"
          :value="1"
          title="Enter information"
        />
        <v-divider />
        <v-stepper-item
          :complete="step > 2"
          :value="2"
          title="Upload data files"
        />
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card flat class="pa-4">
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
              <v-btn color="primary" @click="goSecond" :disabled="!valid">
                Continue
              </v-btn>
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <v-card flat class="pa-4">
            <v-file-input
              chips
              multiple
              label="select files"
              accept="image/*, application/pdf"
              v-model="files"
            ></v-file-input>
            <v-btn color="primary" @click="submit">Submit</v-btn>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useFirebaseStore } from '~/stores/firebase'

// Middleware
definePageMeta({
  middleware: ['authenticated']
})

const route = useRoute()
const router = useRouter()
const firebaseStore = useFirebaseStore()

// Template ref for form
const formRef = ref<any>(null)

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
const requiredRule = [(v: any) => !!v || 'required']

// Methods
const jumpBack = () => {
  drawer.value = false
  router.push({
    name: 'region-region',
    params: { region: route.params.region as string }
  })
}

const goSecond = () => {
  if (formRef.value?.validate()) {
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
