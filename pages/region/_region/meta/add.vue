<template>
  <v-navigation-drawer
    v-model="drawer"
    absolute
    right
    permanent
    :width='512'
  >
    <template v-slot:prepend>
      <div class="pa-2 d-flex justify-space-between">
        <h1>Data Adding</h1>
        <v-btn icon @click='jumpBack'>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider />
    </template>

    <v-stepper
      v-model="step"
      vertical
    >
      <v-stepper-step
        :complete="step > 1"
        step="1"
      >
        Enter information
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field label='TITLE' v-model='meta.title' :rules="requiredRule" />
          <v-select
            :items="securityOptions"
            label="SECURITY"
            v-model='meta.target'
            :rules="requiredRule"
          ></v-select>
          <v-textarea label='DESCRIPTION' rows='3' v-model='meta.comment' :rules="requiredRule" />
          <v-btn
            color="primary"
            @click="goSecond"
            :disabled="!valid"
          >
            Continue
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 2"
        step="2"
      >
        Upload data files
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-file-input
          chips
          multiple
          label="select files"
          accept="image/*, application/pdf"
          v-model='files'
        ></v-file-input>
        <v-btn
          color="primary"
          @click="submit"
        >
          Submit
        </v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'RegionMetaAdd',
  middleware: ['authenticated'],
  data () {
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
      requiredRule: [
        v => !!v || 'required',
      ],
    }
  },
  methods: {
    jumpBack() {
      this.drawer = false
      this.$router.push({ name: 'region-region', params: { region: this.$route.params.region }})
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
        }})
    }
  },
}
</script>

<style>

</style>
