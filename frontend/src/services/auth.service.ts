import { injectable } from "inversify";
import { IAuth, User, UserStaticWebAppData } from "@/@types/auth.service";

class AuthError extends Error {}
@injectable()
export class AuthService implements IAuth {
  /** Current auth'ed user cache **/
  private currentUser: User | undefined = undefined;
  private static readonly ADMIN_ROLE_NAME = "admin";
  private readonly endpoints = (baseUrl: string) => {
    return {
      getUser: `${baseUrl}/.auth/me`,
    };
  };

  constructor() {}

  /**
   * True if the user has admin rights on the app
   */
  public async isAdmin(): Promise<boolean> {
    const u = await this.getUser(false);
    return u.roles.includes(AuthService.ADMIN_ROLE_NAME);
  }

  /**
   * Retrieve the current auth'ed user
   * @param forceRefresh
   */
  public async getUser(forceRefresh: boolean): Promise<User> {
    if (forceRefresh || this.currentUser === undefined) {
      return this.fetchUser();
    }
    return this.currentUser;
  }

  /**
   * Refresh the current user
   * @private
   */
  private async fetchUser(): Promise<User> {
    const res = await fetch(this.endpoints(window.location.origin).getUser, {
      credentials: "include",
    });
    if (!res.ok)
      throw new AuthError(`While trying to fetch user : ${await res.text()}`);

    const rawUser = await res.json();
    return this.mapUser(rawUser);
  }

  /**
   * Map Raw user data received form the auth endpoint to a suitable format
   * @param raw
   * @private
   */
  private mapUser(raw: UserStaticWebAppData): User {
    let roles: string[] = [];
    // Default roles
    roles.push(...raw?.clientPrincipal?.userRoles);
    if (raw.clientPrincipal?.claims?.length > 0) {
      const customRoles = raw.clientPrincipal?.claims
        ?.filter(
          (c) => c.typ.includes("identity/claims/role") || c.typ === "roles"
        )
        ?.map((c) => c.val);
      if (customRoles.length > 0) roles.push(...customRoles);
    }
    roles = roles.filter((r) => r !== undefined);
    const u: User = {
      id: raw?.clientPrincipal?.userId,
      email: raw?.clientPrincipal?.userDetails,
      identityProvider: raw?.clientPrincipal?.identityProvider,
      roles: roles,
    };
    for (const [key, value] of Object.entries(u)) {
      if (value === undefined)
        throw new AuthError(
          `Could not map user : ${key} is undefined. Got raw ${JSON.stringify(
            raw
          )}`
        );
    }
    return u;
  }
}
