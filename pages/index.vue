<template>
  <v-row>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
// import EventBus from '~/utils/EventBus'
export default {
  name: 'IndexPage',
  asyncData({ store }) {
    store.dispatch('firebase/loadRoleRegions')
  },
  components: {
  },
  mounted(){
    // イベント登録
    // EventBus.$on("PICK_REGIONS", this.pickRegions);
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
  },
}
</script>
