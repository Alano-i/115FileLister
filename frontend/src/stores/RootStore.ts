import AuthStore from "./AuthStore";
export default class RootStore {
  auth: AuthStore;

  constructor() {
    this.auth = new AuthStore(this);
  }
}
