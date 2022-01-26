<template>
  <v-container
    class="
      d-flex
      flex-xl-row flex-lg-row flex-column
      justify-space-around
      align-start
      mt-lg-3
    "
  >
    <v-card color="secondary" class="pa-5 mb-5">
      <coupon-creator :category="category"></coupon-creator>
    </v-card>
    <v-card class="ml-lg-5 pa-5">
      <coupon-viewer :category="category"></coupon-viewer>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CouponCreator from "@/components/CouponCreator.vue";
import CouponViewer from "@/components/CouponViewer.vue";
import { COUPON_CATEGORY, ROUTE_MAP } from "@/@types/enums";

@Component({
  components: { CouponCreator, CouponViewer },
})
export default class Promos extends Vue {
  get category(): COUPON_CATEGORY {
    return ROUTE_MAP.get(this.$route.name as string) ?? COUPON_CATEGORY.PROMO;
  }
}
</script>
