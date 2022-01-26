<template>
  <v-container class="d-flex flex-column">
    <h1 class="caption mt-10">Super secret admin page</h1>
    <h3 class="caption mt-10">Secret is {{ getSecret }}</h3>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
@Component({
  computed: mapGetters({
    getSecret: "getSecret",
  }),
})
export default class Admin extends Vue {
  async beforeMount() {
    await this.$store.dispatch("fetchSecret");
  }
}
</script>
