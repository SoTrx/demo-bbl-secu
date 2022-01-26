<template>
  <v-app>
    <component :is="layout()">
      <router-view></router-view>
    </component>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Default from "./layouts/Default.vue";
@Component({
  components: {
    Default,
  },
})
export default class App extends Vue {
  private static readonly DEFAULT_LAYOUT = "Default";

  beforeCreate() {
    //this.$store.dispatch("fetchCoupons");
    // Update coupons every one in a while, invalidating cache
    setInterval(() => this.$store.dispatch("fetchUser", true), 2 * 1000);
    //this.$store.dispatch("showAppBanner", "Test");
  }
  layout() {
    return this?.$route?.meta?.layout || App.DEFAULT_LAYOUT;
  }
}
</script>
