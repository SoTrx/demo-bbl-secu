import { injectable } from "inversify";
import { IAdmin } from "@/@types/admin.service";

@injectable()
export class AdminService implements IAdmin {
  private readonly endpoints = (baseUrl: string) => {
    return {
      getSecret: `${baseUrl}/api/keyvault-relay`,
    };
  };

  constructor(private baseUrl: string) {}

  /**
   * Get all the products in the remote DB
   */
  async getSecret(): Promise<string> {
    const res = await fetch(this.endpoints(this.baseUrl).getSecret);
    if (res.status !== 200)
      throw new Error(`Error while fetching secret -> ${await res.text()}`);
    return (await res.json()).secret;
  }
}
