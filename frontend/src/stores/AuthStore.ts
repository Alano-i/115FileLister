import {
  observable,
  action,
  computed,
  runInAction,
  makeAutoObservable,
} from "mobx";

import RootStore from "./RootStore";

import { ConfigThemeType, themeConfig } from "/@/themes";
import {
  login,
  logout,
  getUserInfo,
  getUserConfig,
  updateUserConfig,
  makePodcast,
} from "/@/api";

interface User {
  is_admin: Boolean;
  username: string;
  uuid: string;
}

interface Config {}

export default class AuthStore {
  @observable
  user?: User | null;

  @observable
  theme: ConfigThemeType = themeConfig.dark;

  @observable
  config?: Config | null;

  @observable
  themeType: boolean = true;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    void this.fetch();
  }

  @computed
  get authenticated(): boolean {
    return !!this.user;
  }

  @computed
  get isDark(): boolean {
    return this.themeType;
  }

  @computed
  get isAdmin(): boolean {
    return !!this.user && !!this.user?.is_admin;
  }

  @action
  fetch = async () => {
    try {
      const res: User = await getUserInfo();
      runInAction(() => {
        this.user = res;
        this.getConfig();
      });
    } catch (err: any) {
      this.user = null;
      throw new Error(err);
    }
  };

  @action
  authLogout = async () => {
    try {
      await logout();
      runInAction(() => {
        this.user = null;
      });
    } catch (err: any) {
      throw new Error(err);
    }
  };

  @action
  authLogin = async (subUser: LoginFormValues) => {
    try {
      await login(subUser);
      runInAction(() => {
        this.fetch();
      });
    } catch (err: any) {
      throw new Error(err);
    }
  };

  @action
  getConfig = async () => {
    try {
      const res = await getUserConfig();
      runInAction(() => {
        const { theme, notify, server } = res as any;
        this.config = {
          ...notify,
          ...server,
          ...notify?.bark,
          ...notify?.qywx,
          ...notify?.telegram,
          theme, // 设置主题字段的初始值
        };
        document
          .querySelector("html")
          ?.setAttribute("theme", theme === "dark" ? "dark" : "light");
        this.theme = theme === "dark" ? themeConfig.dark : themeConfig.light;
        this.themeType = theme === "dark";
      });
    } catch (err: any) {
      throw new Error(err);
    }
  };

  @action
  updateConfig = async (values: any) => {
    try {
      await updateUserConfig(values);
      runInAction(() => {
        this.getConfig();
      });
    } catch (err: any) {
      throw new Error(err);
    }
  };

  @action
  makePodcast = async (values: any) => {
    try {
      await makePodcast(values);
      runInAction(() => {
        // this.getConfig();
      });
    } catch (err: any) {
      throw new Error(err);
    }
  };


}
