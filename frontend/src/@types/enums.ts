export enum COUPON_CATEGORY {
  PROMO,
  /** Food promotions **/
  NO_WASTE,
  CLOTHES,
}

export enum PRINT_STATUS {
  /** The coupon is registered but not sent to backend*/
  NOT_SENT_YET,
  /** The coupon has been sent to backend, waiting for news **/
  SENT_FOR_PRINTING,
  /** The coupon has been printed already **/
  PRINTED,
}
/** Matching between the app routes and the coupon categories */
export const ROUTE_MAP = new Map<string, COUPON_CATEGORY>([
  ["Promos", COUPON_CATEGORY.PROMO],
  ["NoWaste", COUPON_CATEGORY.NO_WASTE],
  ["ClothesSales", COUPON_CATEGORY.CLOTHES],
]);
