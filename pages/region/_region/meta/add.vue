<template>
  <v-navigation-drawer v-model="drawer" absolute right permanent :width="512">
    <template #prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data Adding</h1>
        <v-btn icon @click="jumpBack">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper v-model="step" vertical>
      <v-stepper-step :complete="step > 1" step="1">
        Enter information
      </v-stepper-step>

      <v-stepper-content step="1">
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
          <v-btn color="primary" :disabled="!valid" @click="goSecond">
            Continue
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2">
        Upload data files
      </v-stepper-step>

      <v-stepper-content step="2">
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
export default {
  name: 'RegionMetaAdd',
  middleware: ['authenticated'],
  data() {
    return {
      drawer: true,
      step: 1,
      securityOptions: [
        { text: 'GENERAL', value: 'GENERAL' },
        { text: 'EXPERT', value: 'EXPERT' },
        { text: 'PROJECT', value: 'PROJECT' },
      ],
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
  methods: {
    jumpBack() {
      this.drawer = false
      this.$router.push({
        name: 'region-region',
        params: { region: this.$route.params.region },
      })
    },
    goSecond() {
      if (this.$refs.form.validate()) {
        this.step = 2
      }
    },
    async submit() {
      const metaId = await this.$store.dispatch('firebase/insertMeta', {
        regionId: this.$route.params.region,
        meta: this.meta,
        files: this.files,
      })
      this.$router.push({
        name: 'region-region-meta-meta',
        params: {
          region: this.$route.params.region,
          meta: metaId,
        },
      })
    },
  },
}
</script>

<style></style>
