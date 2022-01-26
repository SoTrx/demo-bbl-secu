<template>
  <v-container class="d-flex flex-column">
    <v-container class="d-flex justify-center">
      <v-color-picker :swatches="colors" show-swatches></v-color-picker>
    </v-container>
    <v-container class="d-flex justify-center">
      <v-btn color="primary" type="submit">Imprimer</v-btn>
    </v-container>
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
export default class NoWaste extends Vue {
  get category(): COUPON_CATEGORY {
    return ROUTE_MAP.get(this.$route.name as string) ?? COUPON_CATEGORY.PROMO;
  }

  get colors() {
    return [
      ["#FF0000", "#AA0000", "#550000"],
      ["#FFFF00", "#AAAA00", "#555500"],
      ["#00FF00", "#00AA00", "#005500"],
      ["#00FFFF", "#00AAAA", "#005555"],
      ["#0000FF", "#0000AA", "#000055"],
    ];
  }
}
</script>
