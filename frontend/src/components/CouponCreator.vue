<template>
  <validation-observer v-slot="{ invalid }">
    <form @submit.prevent="onSubmit">
      <!-- Promo name -->
      <validation-provider name="name" rules="required" v-slot="{ errors }">
        <v-text-field
          v-model="name"
          :error-messages="errors"
          label="Libellé de la réduction"
          required
        ></v-text-field>
        <span>{{ errors[0] }}</span>
      </validation-provider>
      <!-- Dates -->
      <v-container class="d-flex pa-0 ma-0 justify-space-around">
        <validation-provider
          class="mr-2"
          name="fromDate"
          rules="required"
          v-slot="{ errors }"
        >
          <v-menu
            ref="fromMenu"
            v-model="fromMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="fromDate"
                label="Début de validité"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="fromDate"
              no-title
              scrollable
              @input="fromMenu = false"
            >
            </v-date-picker>
          </v-menu>
          <span>{{ errors[0] }}</span>
        </validation-provider>
        <validation-provider name="toDate" rules="required" v-slot="{ errors }">
          <v-menu
            ref="toMenu"
            v-model="toMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="toDate"
                label="Fin de validité"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="toDate"
              no-title
              scrollable
              @input="toMenu = false"
            >
            </v-date-picker>
          </v-menu>
          <span>{{ errors[0] }}</span>
        </validation-provider>
      </v-container>
      <!-- Promo value -->
      <validation-provider
        name="Value"
        :rules="{ required: true, regex: /^[1-9][0-9]?%$|^100%$|^[0-9]+$/ }"
        v-slot="{ errors }"
      >
        <v-text-field
          v-model="rawValue"
          :error-messages="errors"
          label="Valeur de la réduction"
          type="string"
          required
        ></v-text-field>
        <span>{{ errors[0] }}</span>
      </validation-provider>
      <!-- Products  -->
      <v-container class="d-flex pa-0 ma-0 align-center">
        <v-autocomplete
          :filter="filterProducts"
          :items="products"
          label="Produits sur lesquels appliquer la réduction"
          multiple
          v-model="selectedProducts"
        >
          <template v-slot:item="data">
            <!-- View in combobox -->
            <template>
              <v-list-item-content>
                <v-list-item-title v-html="data.item.label"></v-list-item-title>
                <v-list-item-subtitle
                  v-html="data.item.code"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </template>

          <!--View once the item is selected -->
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="removeSelectedProduct(data.item)"
            >
              {{ data.item.label }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-dialog v-model="isBarCodeReaderExtended" width="500">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-barcode</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title class="text-h5 grey lighten-2">
              Scanner un code-barres
            </v-card-title>
            <v-skeleton-loader
              v-if="isBarCodeReaderLoading"
              class="mx-auto"
              max-width="500"
              type="image"
            ></v-skeleton-loader>
            <StreamBarcodeReader
              @decode="onNewBarcode"
              @loaded="isBarCodeReaderLoading = false"
            ></StreamBarcodeReader>

            <v-card-text class="text-center red--text ma-0 pa-0">
              {{ barCodeReaderStatus }}</v-card-text
            >

            <v-card-actions>
              <v-btn text @click="isBarCodeReaderExtended = false">
                Annuler
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>

      <v-btn color="primary" type="submit" :disabled="invalid">Ajouter</v-btn>
    </form>
  </validation-observer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
import { extend, ValidationObserver, ValidationProvider } from "vee-validate";
import { regex, required } from "vee-validate/dist/rules";
import { ICoupon, IProduct } from "@/@types/backend.service";
import { COUPON_CATEGORY, PRINT_STATUS } from "@/@types/enums";
import { StreamBarcodeReader } from "vue-barcode-reader";
import { v4 as uuid } from "uuid";
extend("required", {
  ...required,
  message: "This field is required",
});
extend("regex", {
  ...regex,
  message: "This value isn't a valid percentage or flat number !",
});

@Component({
  computed: mapGetters({
    getApiResp: "getApiResp",
    products: "getProducts",
  }),
  components: { ValidationProvider, ValidationObserver, StreamBarcodeReader },
})
export default class CouponCreator extends Vue {
  @Prop({ required: true })
  private category!: COUPON_CATEGORY;
  /** Name of the new Coupon **/
  private name: string = "";
  /** Start date **/
  private fromDate: string = "";
  /** Date picker toggle for the start date **/
  private fromMenu = false;
  /** End date **/
  private toDate: string = "";
  /** Date picker toggle for the end date **/
  private toMenu = false;
  /** Coupon value, cna be either a percentage or a flat value **/
  private rawValue: string = "";
  /** Products included in the promotion **/
  private selectedProducts: IProduct[] = [];
  /** Barcode modal toggle*/
  private isBarCodeReaderExtended = false;
  /** Barcode skeleton loader toggle */
  private isBarCodeReaderLoading = true;
  private barCodeReaderStatus = "";

  private onSubmit(): void {
    const coupon: ICoupon<IProduct> = {
      id: uuid(),
      name: this.name,
      fromDate: new Date(this.fromDate),
      toDate: new Date(this.toDate),
      value: Number(this.rawValue.replace("%", "").trim()),
      isPercentage: this.rawValue.includes("%"),
      productsIds: this.selectedProducts.map((p) => p.id),
      category: this.category,
      printStatus: PRINT_STATUS.NOT_SENT_YET,
    };
    this.$store.dispatch("addCoupon", coupon);
  }

  private onNewBarcode(res: string) {
    const product = this.$store.getters.getProducts.find(
      (p: IProduct) => p.code === res
    );
    if (product === undefined) {
      this.barCodeReaderStatus = `Aucun produit avec le code ${res}`;
      return;
    }
    if (this.selectedProducts.find((p) => p.id === product.id)) {
      this.barCodeReaderStatus = `"${product.label}" est déjà dans la liste des produits !`;
      return;
    }
    this.selectedProducts.push(product);
    this.barCodeReaderStatus = "";
    this.isBarCodeReaderExtended = false;
  }

  /**
   *  Filtering function for the product comboBox.
   * A product can be searched by name or by id
   * **/
  filterProducts(item: IProduct, queryText: string, itemText: string): boolean {
    // like UNUSED in C
    void itemText;
    const q = queryText.toLocaleLowerCase();
    return item.code.includes(q) || item.label.includes(q);
  }

  /** Unselect a product **/
  removeSelectedProduct(p: IProduct): void {
    this.selectedProducts = this.selectedProducts.filter(
      (product: IProduct) => product.id !== p.id
    );
  }
}
</script>

<style>
form {
  border: black 1px;
}
</style>
