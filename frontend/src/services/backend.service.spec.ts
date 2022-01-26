import "reflect-metadata";
import { container } from "@/inversify.config";
import type { IBackend, ICoupon, IProduct } from "../@types/backend.service";
import { TYPES } from "../types";
// Using node-fetch to replace browser native fetch api while testing
//@ts-ignore
import fetch from "node-fetch";
//@ts-ignore
global.fetch = fetch;

describe("Backend", () => {
  const backend = container.get<IBackend>(TYPES.BackendService);
  describe(" -> Products", () => {
    it(":GET", async () => {
      const products = await backend.getProducts();
      console.log(products);
    });
  });
  describe(" -> Coupons", () => {
    it(":GET", async () => {
      const items = await backend.getCoupons();
      console.log(items);
    });
    it(":POST", async () => {
      const coupons: ICoupon<IProduct>[] = [
        {
          id: " b47bf70d-3cab-4793-8ad3-4a9a00c39258",
          name: "Much reduction",
          fromDate: new Date("2021-10-27T00:00:00.000Z"),
          toDate: new Date("2021-12-31T00:00:00.000Z"),
          value: 500,
          category: 1,
          isPercentage: false,
          productsIds: [2],
          printStatus: 2,
        },
      ];
      const res = await backend.printCoupons(coupons);
      // @ts-ignore
      console.log(res?.[0]?.["odata.error"]?.message);
    });
  });
});
