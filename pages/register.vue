<template>
  <v-navigation-drawer
    v-model="drawer"
    absolute
    right
    permanent
    :width='width'
  >
    <template v-slot:prepend>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Data registration
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
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
        Create new region
      </v-stepper-step>

      <v-stepper-content step="1">
        <small class="grey--text">Point vertices of the region counterclockwise.</small>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 2"
        step="2"
      >
        Enter information
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form v-model="valid" lazy-validation>
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
            @click="step = 3"
            :disabled="!valid"
          >
            Continue
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 3"
        step="3"
      >
        Upload data files
      </v-stepper-step>

      <v-stepper-content step="3">
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
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block @click='jumpRoot'>
          Cancel
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import EventBus from '~/utils/EventBus'

export default {
  name: 'RegisterRegion',
  mounted(){
    // イベント登録
    EventBus.$on("REGISTER_SECOND_STEP", this.goSecond)
  },
  data () {
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
      valid: true,
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
  watch: {
    step(val) {
      if (val > 1) {
        this.width = 512
      }
    }
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
    async submit() {
      const { regionId, metaId } = await this.$store.dispatch('firebase/register', {
        points: this.points,
        meta: this.meta,
        files: this.files,
      })
      this.$router.push({
        name: 'region-region-meta-meta',
        params: {
          region: regionId,
          meta: metaId,
        }
      })
    }
  },
}
</script>

<style>

</style>
