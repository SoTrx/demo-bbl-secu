import { injectable } from "inversify";
import {
  IAuth,
  User,
  UserAppServiceData,
  UserStaticWebAppData,
} from "@/@types/auth.service";

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

    const rawUser: [UserAppServiceData] = await res.json();
    return this.mapUser(rawUser?.[0]);
  }

  /**
   * Map Raw user data received form the auth endpoint to a suitable format
   * @param raw
   * @private
   */
  private mapUser(raw: UserAppServiceData): User {
    const u: User = {
      id: raw?.user_id,
      email: raw?.user_id,
      identityProvider: raw?.provider_name,
      access_token: raw?.access_token,
      roles:  raw?.user_claims?.filter((claim) => claim.typ === "roles").map((c) => c.val),
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
