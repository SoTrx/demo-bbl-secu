import Vue from "vue";
import Router from "vue-router";
import Promos from "@/pages/Promos.vue";
import ClothesSales from "@/pages/ClothesSales.vue";
import NoWaste from "@/pages/NoWaste.vue";
import Admin from "@/pages/Admin.vue";
Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "Promos",
      //@ts-ignore
      component: Promos,
    },
    {
      path: "/nowaste",
      name: "NoWaste",
      //@ts-ignore
      component: NoWaste,
    },
    {
      path: "/clothes",
      name: "ClothesSales",
      //@ts-ignore
      component: ClothesSales,
    },
    {
      path: "/admin",
      name: "Administration",
      //@ts-ignore
      component: Admin,
      meta: {
        requireAdmin: true,
      },
    },
  ],
});
router.beforeEach((to, from, next) => {
  if (to?.meta?.requireAdmin && !router.app.$store.getters.isAdmin) next("/");
  else next();
});

export default router;
