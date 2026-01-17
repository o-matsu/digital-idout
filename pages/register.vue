<template>
  <v-navigation-drawer v-model="drawer" absolute right permanent :width="width">
    <template #prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data registration</h1>
        <v-btn icon @click="jumpRoot">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper v-model="step" vertical>
      <v-stepper-step :complete="step > 1" step="1">
        Create new region
      </v-stepper-step>

      <v-stepper-content step="1">
        <small class="grey--text"
          >Point vertices of the region counterclockwise.</small
        >
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2">
        Enter information
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form ref="form" v-model="valid" lazy-validation>
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
          <v-btn color="primary" :disabled="!valid" @click="goThird">
            Continue
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step :complete="step > 3" step="3">
        Upload data files
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-file-input
          v-model="files"
          chips
          multiple
          label="select files"
          accept="image/*, application/pdf"
        />
        <v-btn color="primary" @click="submit"> Submit </v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-navigation-drawer>
</template>

<script>
import EventBus from '~/utils/EventBus'

export default {
  name: 'RegisterRegion',
  middleware: ['authenticated'],
  data() {
    return {
      drawer: true,
      width: 256,
      step: 1,
      securityOptions: [
        { text: 'GENERAL', value: 'GENERAL' },
        { text: 'EXPERT', value: 'EXPERT' },
        { text: 'PROJECT', value: 'PROJECT' },
      ],
      points: [],
      valid: false,
      meta: {
        title: '',
        target: null,
        comment: '',
      },
      files: [],
      requiredRule: [(v) => !!v || 'required'],
    }
  },
  watch: {
    step(val) {
      if (val > 1) {
        this.width = 512
      }
    },
  },
  mounted() {
    // イベント登録
    EventBus.$on('REGISTER_SECOND_STEP', this.goSecond)
  },
  methods: {
    jumpRoot() {
      this.drawer = false
      this.$router.push({ name: 'index' })
    },
    goSecond(pointArray) {
      this.step = 2
      this.points = pointArray
    },
    goThird() {
      if (this.$refs.form.validate()) {
        this.step = 3
      }
    },
    async submit() {
      const { regionId, metaId } = await this.$store.dispatch(
        'firebase/register',
        {
          points: this.points,
          meta: this.meta,
          files: this.files,
        },
      )
      this.$router.push({
        name: 'region-region-meta-meta',
        params: {
          region: regionId,
          meta: metaId,
        },
      })
    },
  },
}
</script>

<style></style>
