import { injectable } from "inversify";
import { IBackend, ICoupon, IProduct } from "@/@types/backend.service";
import products from "./data/products.json";
import coupons from "./data/coupons.json";
@injectable()
export class BackendServiceMock implements IBackend {
  retrieveResult(): Promise<Record<string, unknown>> {
    return Promise.resolve({ meh: "mah" });
  }

  getProducts(): Promise<IProduct[]> {
    return Promise.resolve(products);
  }

  getCoupons(): Promise<ICoupon<IProduct>[]> {
    const parsedCoupons: ICoupon<IProduct>[] = [];
    coupons.forEach((c) => {
      parsedCoupons.push(
        Object.assign(c, {
          toDate: new Date(c.toDate),
          fromDate: new Date(c.fromDate),
        })
      );
    });
    return Promise.resolve(parsedCoupons);
  }

  registerCoupon(coupon: ICoupon<IProduct>): Promise<void> {
    return Promise.resolve(undefined);
  }

  printCoupons(coupons: ICoupon<IProduct>[]): Promise<void[]> {
    return Promise.resolve([undefined]);
  }
}
