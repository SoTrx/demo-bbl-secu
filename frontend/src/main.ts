import "./components-hooks";
import "reflect-metadata";
import Vue from "vue";
import Vuetify from "vuetify/lib";
import App from "./App.vue";

import "vuetify/dist/vuetify.css";
import router from "./router";
import { vueInversifyPlugin } from "@vanroeybe/vue-inversify-plugin";
import { container } from "./inversify.config";
import store from "./store";
Vue.config.productionTip = false;
Vue.config.devtools = false;

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#3f9aef",
        secondary: "#ffffff",
        accent: "#8c9eff",
        error: "#b71c1c",
        background: "#f0f4f7",
      },
    },
  },
});

Vue.use(Vuetify);
import fr from "vuetify/src/locale/fr";
Vue.use(vueInversifyPlugin(container));

new Vue({
  el: "#app",
  router,
  render: (h) => h(App),
  vuetify: new Vuetify({
    lang: {
      locales: { fr },
      current: "fr",
    },
    theme: { dark: false },
  }),
  store: store,
});
