import Vuex from "vuex";
import Vue from "vue";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { IBackend, ICoupon, IProduct } from "@/@types/backend.service";
import { COUPON_CATEGORY, PRINT_STATUS } from "@/@types/enums";
import { IAuth, User } from "@/@types/auth.service";
import { IAdmin } from "@/@types/admin.service";

Vue.use(Vuex);

const backend = container.get<IBackend>(TYPES.BackendService);
const auth = container.get<IAuth>(TYPES.AuthService);
const admin = container.get<IAdmin>(TYPES.AdminService);

export default new Vuex.Store({
  state: {
    products: [],
    coupons: [],
    user: {
      id: "",
      email: "",
      roles: [],
      identityProvider: "",
    },
    secret: "",
    isAdmin: false,
    errorMessage: "",
    infoMessage: "",
    isLoading: false,
    isOnline: true,
  },
  getters: {
    getProducts(state): IProduct[] {
      return state.products;
    },
    getCoupons(state): ICoupon<IProduct>[] {
      // This property entirely depends on a network call.
      // If something goes wrong with the server, it might
      // become undefined. In vuex, undefined is NOT a
      // reactive property, and this may break data display.
      if (state.coupons === undefined) state.coupons = [];
      return state.coupons;
    },
    getCouponsWithCat: (state) => (cat: COUPON_CATEGORY) => {
      // @see getCoupons
      if (state.coupons === undefined) state.coupons = [];
      return state.coupons.filter((c: ICoupon<IProduct>) => c.category === cat);
    },
    getErrorMessage(state): string {
      return state.errorMessage;
    },
    getInfoMessage(state): string {
      return state.infoMessage;
    },
    isLoading(state): boolean {
      return state.isLoading;
    },
    isOnline(state): boolean {
      return state.isOnline;
    },
    getUser(state): User {
      return state.user;
    },
    isAdmin(state): boolean {
      return state.isAdmin;
    },
    getSecret(state): string {
      return state.secret;
    },
  },
  mutations: {
    setProducts(state: Record<string, unknown>, products: IProduct[]) {
      state.products = products;
    },
    setCoupons(state: Record<string, unknown>, coupons: ICoupon<IProduct>[]) {
      state.coupons = coupons;
    },
    addCoupon(state: Record<string, any>, coupon: ICoupon<IProduct>) {
      state.coupons.push(coupon);
    },
    setErrorMessage(state: Record<string, any>, message: string) {
      state.errorMessage = message;
    },
    setInfoMessage(state: Record<string, any>, message: string) {
      state.infoMessage = message;
    },
    setLoading(state: Record<string, any>, isLoading: boolean) {
      state.isLoading = isLoading;
    },
    setOnline(state: Record<string, any>, isOnline: boolean) {
      state.isOnline = isOnline;
    },
    setUser(state: Record<string, any>, user: User) {
      state.user = user;
    },
    setAdmin(state: Record<string, any>, isAdmin: boolean) {
      state.isAdmin = isAdmin;
    },
    setSecret(state: Record<string, any>, secret: string) {
      state.secret = secret;
    },
  },
  actions: {
    /** Fetch the current authed user **/
    async fetchSecret({ commit, state }: any) {
      const secret = await admin.getSecret();
      commit("setSecret", secret);
    },
    /** Fetch the current authed user **/
    async fetchUser({ commit, state }: any, forceRefresh = false) {
      const user = await auth.getUser(forceRefresh);
      const isAdmin = await auth.isAdmin();
      commit("setUser", user);
      commit("setAdmin", isAdmin);
    },
    /** Get all products from the backend */
    async fetchProducts({ commit, state }: any, invalidateCache = false) {
      commit("setLoading", true);
      if (
        invalidateCache ||
        !state.products ||
        Object.keys(state.products).length === 0
      ) {
        const products = await catchNetworkErrors(
          () => backend.getProducts(),
          commit
        );

        //const products = await backend.getProducts();
        commit("setProducts", products);
      }
      commit("setLoading", false);
    },
    /** Get all coupons from the backend */
    async fetchCoupons({ commit, state }: any, invalidateCache = false) {
      commit("setLoading", true);
      if (
        invalidateCache ||
        !state.coupons ||
        Object.keys(state.coupons).length === 0
      ) {
        const coupons = await catchNetworkErrors(
          () => backend.getCoupons(),
          commit
        );

        //const coupons = await backend.getCoupons();
        commit("setCoupons", coupons);
      }
      commit("setLoading", false);
    },
    /** Get all coupons from the backend */
    async updateCoupons({ commit, state, getters }: any) {
      commit("setLoading", true);
      const newCoupons = await catchNetworkErrors(
        () => backend.getCoupons(),
        commit
      );
      // Probably offline
      if (!newCoupons) return;
      //const newCoupons = await backend.getCoupons();
      let oldCoupons = getters.getCoupons;
      if (oldCoupons === undefined) {
        commit("setCoupons", newCoupons);
        console.log("set coupons");
        oldCoupons = newCoupons;
      }

      const newCouponsIds = newCoupons.map((c: ICoupon<IProduct>) => c.id);
      // These aren't registered in the backend, we must keep them locally
      // while they're not sent for printing or the backend hasn't registered them yet
      const localCoupons = oldCoupons?.filter(
        (c: ICoupon<IProduct>) =>
          c.printStatus === PRINT_STATUS.NOT_SENT_YET ||
          (c.printStatus === PRINT_STATUS.SENT_FOR_PRINTING &&
            !newCouponsIds.includes(c.id))
      );

      // These are waiting for a status update
      const watchedCoupons = oldCoupons?.filter(
        (c: ICoupon<IProduct>) =>
          c.printStatus === PRINT_STATUS.SENT_FOR_PRINTING
      );
      const watchedIds = watchedCoupons.map((c: ICoupon<IProduct>) => c.id);
      // An updated coupon is...
      const updatedCoupons = newCoupons
        // A coupon that was already in the local cache...
        .filter((c: ICoupon<IProduct>) => watchedIds.includes(c.id))
        // But with a different printing status...
        .filter(
          (c: ICoupon<IProduct>) =>
            c.printStatus !==
            watchedCoupons.find((wc: ICoupon<IProduct>) => wc.id === c.id)
              .printStatus
        );
      // Show an info banner if coupons have been printed
      if (updatedCoupons.length !== 0) {
        commit(
          "setInfoMessage",
          `${updatedCoupons
            .map((c: ICoupon<IProduct>) => `"${c.name}"`)
            .join(", ")} imprimé(s)`
        );
        setTimeout(() => {
          commit("setInfoMessage", ``);
        }, 5000);
      }
      // Add local only coupons "not sent yet"
      newCoupons.push(...localCoupons);
      commit("setCoupons", newCoupons);
      commit("setLoading", false);
    },
    /** Add a new coupon without sending it to the backend */
    addCoupon({ commit, state }: any, coupon: ICoupon<IProduct>) {
      commit("addCoupon", coupon);
    },
    /** Send the given coupons to be printed */
    async printCoupons(
      { commit, state, getters }: any,
      coupons: ICoupon<IProduct>[]
    ) {
      commit("setLoading", true);
      let done = false;
      let attemptCount = 0;
      do {
        try {
          await backend.printCoupons(coupons);
          commit("setErrorMessage", ``);
          done = true;
        } catch (e) {
          commit(
            "setErrorMessage",
            `Could not send coupon, retrying in 10s (Attempt ${++attemptCount})`
          );
          await new Promise((res) => setTimeout(res, 10 * 1000));
        }
      } while (!done);

      //await backend.printCoupons(coupons);
      // Set "Not sent yet" coupons to "Sent"
      const updatedCoupons = this.state.coupons.map((c: ICoupon<IProduct>) => {
        if (c.printStatus === PRINT_STATUS.NOT_SENT_YET)
          c = Object.assign(c, { printStatus: PRINT_STATUS.SENT_FOR_PRINTING });
        return c;
      });
      commit("setCoupons", updatedCoupons);
      // TODO : Polling / SignalR for printing status change ?
      commit("setLoading", false);
    },
    /** Show a global app banner with the provided message **/
    showAppError({ commit, state }: any, message: string) {
      commit("setErrorMessage", message);
    },
    /** Show a global app banner with the provided message **/
    showAppInfo({ commit, state }: any, message: string) {
      commit("setInfoMessage", message);
    },
    toggleLoadingBar({ commit, state }: any, isLoading: boolean) {
      commit("setLoading", isLoading);
    },
    toggleOnline({ commit, state }: any, isOnline: boolean) {
      commit("setOnline", isOnline);
    },
  },
});

async function catchNetworkErrors(query: () => Promise<any>, commit: any) {
  try {
    const res = await query();
    commit("setOnline", true);
    commit("setErrorMessage", ``);
    return res;
  } catch (e) {
    commit("setOnline", false);
    commit(
      "setErrorMessage",
      `You appear to be offline. Waiting to get back online ...`
    );
  }
}
