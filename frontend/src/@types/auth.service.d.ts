/**
 * A proper user to use in the lifecycle of the app
 */
export interface User {
  identityProvider: string;
  email: string;
  id: string;
  roles: string[];
  access_token?: string;
}

/**
 * User data as fetched from the static webapp endpoint
 */
export interface UserStaticWebAppData {
  clientPrincipal: {
    identityProvider: string;
    userDetails: string;
    userId: string;
    userRoles: string[];
    claims: { typ: string; val: string }[];
  };
}

/**
 * User data as fetched from the app services endpoint
 */
export interface UserAppServiceData {
  access_token: string;
  expires_on: string;
  id_token: string;
  user_id: string;
  provider_name: string;
  user_claims: { typ: string; val: string }[];
}

export interface IAuth {
  /**
   * True if the user has admin rights on the app
   */
  isAdmin(): Promise<boolean>;

  /**
   * Retrieve the current auth'ed user
   * @param forceRefresh
   */
  getUser(forceRefresh: boolean): Promise<User>;
}
