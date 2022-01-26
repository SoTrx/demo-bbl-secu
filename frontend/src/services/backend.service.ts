import {
  StoredCoupon,
  IBackend,
  ICoupon,
  IProduct,
} from "@/@types/backend.service";
import { injectable } from "inversify";
//@ts-ignore
import { v4 as uuid } from "uuid";
import { PRINT_STATUS } from "@/@types/enums";

@injectable()
export class BackendService implements IBackend {
  private readonly endpoints = (baseUrl: string) => {
    return {
      getProducts: `${baseUrl}/rdo/products`,
      getCoupons: `${baseUrl}/prints`,
      registerCoupon: `${baseUrl}/prints`,
      printCoupon: `${baseUrl}/prints/new`,
    };
  };

  constructor(private baseUrl: string, private subKey: string) {}

  /**
   * Get all the products in the remote DB
   */
  getProducts(): Promise<IProduct[]> {
    return this.executeBackingOff<IProduct[]>(async () =>
      (
        await fetch(this.endpoints(this.baseUrl).getProducts, {
          headers: this.headers,
        })
      ).json()
    );
  }

  getCoupons(): Promise<ICoupon<IProduct>[]> {
    // Retrieve the response
    return this.executeBackingOff<ICoupon<IProduct>[]>(async () => {
      const res = await (
        await fetch(this.endpoints(this.baseUrl).getCoupons, {
          headers: this.headers,
        })
      ).json();
      if (!res.value) throw new Error(res);
      // Map the coupons object to local model, removing unused properties
      const coupons: StoredCoupon<IProduct>[] = res.value;
      return coupons.map(({ PartitionKey, RowKey, Timestamp, ...partial }) =>
        Object.assign(partial, {
          productsIds: JSON.parse(partial.productsIds as unknown as string),
          toDate: new Date(partial.toDate),
          fromDate: new Date(partial.fromDate),
        })
      );
    });
  }

  /**
   * Send a group of coupons for printing
   * @param coupons
   */
  async printCoupons(coupons: ICoupon<IProduct>[]): Promise<void[]> {
    return Promise.all(coupons.map((c) => this.printCoupon(c)));
  }

  /**
   * Send a single coupon for printing
   * @param coupon
   * @private
   */
  private async printCoupon(coupon: ICoupon<IProduct>): Promise<void> {
    const body: StoredCoupon<IProduct> = Object.assign({}, coupon, {
      PartitionKey: String(coupon.fromDate.getFullYear()),
      RowKey: coupon.id,
      toDate: coupon.toDate.toISOString(),
      fromDate: coupon.fromDate.toISOString(),
      productsIds: JSON.stringify(coupon.productsIds),
      printStatus: PRINT_STATUS.SENT_FOR_PRINTING,
    });
    return this.executeBackingOff<void>(async () => {
      const res = await fetch(this.endpoints(this.baseUrl).printCoupon, {
        headers: this.headers,
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.status !== 201)
        throw new Error(`${res.status} - ${await res.text()}`);
    });
  }

  async registerCoupon(coupon: ICoupon<IProduct>): Promise<void> {
    const body: ICoupon<IProduct> = Object.assign({}, coupon, {
      //PartitionKey: String(coupon.fromDate.getFullYear()),
      //RowKey: coupon.id,
      toDate: coupon.toDate.toISOString(),
      fromDate: coupon.fromDate.toISOString(),
      productsIds: JSON.stringify(coupon.productsIds),
      printStatus: PRINT_STATUS.SENT_FOR_PRINTING,
    });
    return this.executeBackingOff<void>(async () => {
      return (
        await fetch(this.endpoints(this.baseUrl).registerCoupon, {
          headers: this.headers,
          method: "POST",
          body: JSON.stringify(body),
        })
      ).json();
    });
  }

  /**
   * Get necessary headers to make a request to the backend.
   * Mainly authorization key
   */
  private get headers() {
    return {
      "Ocp-Apim-Subscription-Key": this.subKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Retry a request, backing-off exponentially until giving up
   * @param request
   * @param opt
   */
  private async executeBackingOff<T>(
    request: () => Promise<T>,
    opt = { maxAttempts: 2 }
  ): Promise<T> {
    const randInt = (from: number, to: number) =>
      Math.floor(Math.random() * to) + from;

    let done = false;
    let attempts = 1;
    let payload: T;
    do {
      try {
        payload = await request();
        console.log(payload);
        done = true;
      } catch (e) {
        console.error(e);
        attempts++;
        if (attempts > opt.maxAttempts)
          throw new Error(`Max attempt count reached`);
        // Wait a semi-random interval before sending another request
        const delay = Math.pow(randInt(20, 25), attempts);
        await new Promise((res) => setTimeout(res, delay));
      }
    } while (!done);

    return payload!;
  }
}
