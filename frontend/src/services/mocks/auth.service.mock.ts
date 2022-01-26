import { injectable } from "inversify";
import { IAuth, User } from "@/@types/auth.service";
//@ts-ignore
import users from "./data/users.json";

@injectable()
export class AuthServiceMock implements IAuth {
  private static readonly ADMIN_ROLE_NAME = "admin";

  constructor(private adminUser: boolean) {}

  getUser(forceRefresh: boolean): Promise<User> {
    const u = users.find((u: User) => {
      const isAdmin = u.roles.includes(AuthServiceMock.ADMIN_ROLE_NAME);
      return this.adminUser ? isAdmin : !isAdmin;
    });
    if (u === undefined) throw new Error("Incomplete user JSON");
    return Promise.resolve(u);
  }

  async isAdmin(): Promise<boolean> {
    console.log(await this.getUser(false));
    return (await this.getUser(false)).roles.includes(
      AuthServiceMock.ADMIN_ROLE_NAME
    );
  }
}
