<template>
  <div class="d-flex flex-column">
    <v-data-table :headers="headers" :items="tableData" :items-per-page="20">
    </v-data-table>
    <v-btn
      class="align-self-end mt-2"
      color="primary"
      type="submit"
      :disabled="couponsToSend.length === 0"
      @click.prevent="printCoupons()"
      :loading="isPrinting"
      >Imprimer</v-btn
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ICoupon, IProduct } from "@/@types/backend.service";
import { COUPON_CATEGORY, PRINT_STATUS } from "@/@types/enums";

@Component({})
export default class CouponViewer extends Vue {
  @Prop({ required: true })
  private category!: COUPON_CATEGORY;

  private isPrinting = false;

  get tableData() {
    //const products = this.$store.getters.getProducts;
    return this.$store.getters
      .getCouponsWithCat(this.category)
      .map((c: ICoupon<IProduct>) => {
        const products = this.$store.getters.getProducts
          .filter((p: IProduct) => c.productsIds.includes(p.id))
          .map((p: IProduct) => p.label)
          .join(", ");
        return {
          name: c.name,
          fromDate: this.toReadableDate(c.fromDate),
          toDate: this.toReadableDate(c.toDate),
          // A bit unholy way of adding a "%" when the value is a percentage
          value: `${c.value}${"%".repeat(Number(c.isPercentage))}`,
          products: products,
          printingStatus: this.toReadablePrintStatus(c.printStatus),
        };
      });
  }

  get headers() {
    return [
      {
        text: "Libellé",
        value: "name",
      },
      {
        text: "Valeur",
        value: "value",
      },
      {
        text: "Valide du",
        value: "fromDate",
      },
      {
        text: "Jusqu'au",
        value: "toDate",
      },
      {
        text: "Valide pour",
        value: "products",
      },
      {
        text: "Impression",
        value: "printingStatus",
      },
    ];
  }

  private get couponsToSend(): ICoupon<IProduct>[] {
    return this.$store.getters
      .getCouponsWithCat(this.category)
      .filter(
        (c: ICoupon<IProduct>) => c.printStatus === PRINT_STATUS.NOT_SENT_YET
      );
  }

  /** Send the coupons for printing */
  private async printCoupons(): Promise<void> {
    this.isPrinting = true;
    await this.$store.dispatch("printCoupons", this.couponsToSend);
    this.isPrinting = false;
  }

  private toReadableDate(d: Date): string {
    return d.toLocaleString("fr", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "numeric",
    });
  }
  private toReadablePrintStatus(status: PRINT_STATUS) {
    switch (status) {
      case PRINT_STATUS.NOT_SENT_YET:
        return `Demande non envoyée`;
      case PRINT_STATUS.SENT_FOR_PRINTING:
        return `Demande envoyée`;
      case PRINT_STATUS.PRINTED:
        return `Imprimé`;
      default:
        return "Inconnu";
    }
  }
}
</script>

<style>
form {
  border: black 1px;
}
</style>
