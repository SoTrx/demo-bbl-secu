export interface IAdmin {
  /** Get super secret admin data **/
  getSecret(): Promise<string>;
}
