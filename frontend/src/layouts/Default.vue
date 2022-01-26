<template>
  <v-app :style="{ background: $vuetify.theme.themes[theme].background }">
    <v-app-bar app color="secondary">
      <v-app-bar-title class="mr-4 text-no-wrap">
        <v-avatar size="54"> <v-img src="/logo.png"> </v-img></v-avatar>
      </v-app-bar-title>
      <h2 class="mt-1 text-no-wrap text-subtitle-1">Mytickets</h2>

      <v-tabs centered show-arrows>
        <v-tab
          ><router-link style="text-decoration: none; color: inherit" to="/"
            ><v-icon class="mr-1">mdi-chart-bar</v-icon>Anim.
            Commerciales</router-link
          ></v-tab
        >
        <v-tab
          ><router-link
            style="text-decoration: none; color: inherit"
            to="/nowaste"
            ><v-icon class="mr-1">mdi-food-apple</v-icon>Anti-Gaspi</router-link
          ></v-tab
        >
        <v-tab
          ><router-link
            style="text-decoration: none; color: inherit"
            to="/clothes"
            ><v-icon class="mr-1">mdi-tshirt-crew</v-icon>Soldes
            textiles</router-link
          ></v-tab
        >
        <v-tab v-if="isAdmin"
          ><router-link
            style="text-decoration: none; color: inherit"
            to="/admin"
            ><v-icon class="mr-1">mdi-wrench</v-icon>Administration</router-link
          ></v-tab
        >
      </v-tabs>
      <v-divider vertical></v-divider>
      <v-avatar class="mr-2 ml-2">
        <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
      </v-avatar>
      {{ user.email }}
    </v-app-bar>
    <v-main>
      <v-progress-linear
        :active="isLoading"
        height="0.4rem"
        :indeterminate="true"
        absolute
        top
        color="primary accent-4"
      ></v-progress-linear>
      <v-banner
        v-if="errorMessage.length !== 0"
        color="warning"
        single-line
        sticky
        >{{ errorMessage }}</v-banner
      >
      <v-banner
        v-if="infoMessage.length !== 0"
        color="info"
        single-line
        sticky
        >{{ infoMessage }}</v-banner
      >
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
@Component({
  computed: mapGetters({
    errorMessage: "getErrorMessage",
    infoMessage: "getInfoMessage",
    isLoading: "isLoading",
    user: "getUser",
    isAdmin: "isAdmin",
  }),
})
export default class Default extends Vue {
  get theme() {
    return this.$vuetify.theme.dark ? "dark" : "light";
  }
}
</script>

<style></style>
