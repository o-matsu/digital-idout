<template>
  <v-card
    dark
    hover
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <v-chip small class="mt-4 ml-2">
          {{ data.targetRole }}
        </v-chip>
        <v-card-title
          class="text-h5 pt-0 d-inline-block text-truncate"
          v-text="data.title"
          style="max-width: 200px;"
        ></v-card-title>
        <v-card-subtitle class="grey--text text-lighten-5">
          <div>{{ data.authorId }}</div>
          <div>{{ datetime }}</div>
        </v-card-subtitle>
      </div>

      <v-avatar
        v-if='data.files'
        class="ma-3"
        size="111"
        tile
      >
        <v-img :src="data.files[0].src"></v-img>
      </v-avatar>
    </div>
  </v-card>
</template>

<script>
import { format } from 'date-fns'

export default {
  props: {
    data: { type: Object, required: true }
  },
  computed: {
    datetime() {
      return format(this.data.createdAt.toDate(), 'yyyy-MM-dd kk:mm')
    },
  },
}
</script>

<style>

</style>
