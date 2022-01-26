import { injectable } from "inversify";
import { IAdmin } from "@/@types/admin.service";
@injectable()
export class AdminServiceMock implements IAdmin {
  getSecret(): Promise<string> {
    return Promise.resolve("SUCH SECRET");
  }
}
