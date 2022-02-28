<template>
  <v-row>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import EventBus from '~/utils/EventBus'
export default {
  name: 'IndexPage',
  asyncData({ store }) {
    store.dispatch('firebase/loadRoleRegions')
  },
  components: {
  },
  mounted(){
    // イベント登録
    EventBus.$on("PICK_REGIONS", this.pickRegions);
  },
  computed: {
    ...mapGetters({
    })
  },
  data() {
    return {}
  },
  watch: {
  },
  methods: {
    pickRegions(targets) {
      // await this.$store.dispatch('firebase/loadMetasByRegion', targets[0].object.name)
      this.$nuxt.context.redirect({ name: 'region-id', params: { id: targets[0].object.name }})
    }
  },
}
</script>
