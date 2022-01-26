/** A Product on the shelves **/
import { COUPON_CATEGORY, PRINT_STATUS } from "@/@types/enums";

export interface IProduct {
  /** uuid **/
  id: number;
  /** Human readable name **/
  label: string;
  /** barcode value **/
  code: string;
}

/** A coupon code on a target type T**/
export interface ICoupon<T> {
  id: string;
  /** Name, can be non-unique **/
  name: string;
  /** Coupon category. Printed or nt */
  category: COUPON_CATEGORY;
  /** When the coupon will be valid **/
  fromDate: Date;
  /** When the coupon will no longer be valid **/
  toDate: Date;
  /** How many euros / percentage **/
  value: number;
  /** Is the coupon deducting a percentage of the price or a flat value ? **/
  isPercentage: boolean;
  /** Products included in the promotion, by id */
  productsIds: T[id][];
  /** Has this coupon been printed yet ?*/
  printStatus: PRINT_STATUS;
}

/** A coupon as stored in Az table */
export type StoredCoupon<T> = ICoupon<T> & {
  PartitionKey: string;
  RowKey: string;
  Timestamp?: string;
};

export interface IBackend {
  /** Get all products on the shelves */
  getProducts(): Promise<IProduct[]>;
  /** Get all coupons code registered **/
  getCoupons(): Promise<ICoupon<IProduct>[]>;
  /** Register a new coupon in db **/
  registerCoupon(coupon: ICoupon<IProduct>): Promise<void>;
  /** Send the provided (already existing) coupons to be printed **/
  printCoupons(coupons: ICoupon<IProduct>[]): Promise<void[]>;
}
