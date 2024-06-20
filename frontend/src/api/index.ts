import { defHttp } from "/@/http";

/**
 * 登录
 * @param data
 * @returns
 */
export const login = (data: LoginFormValues) =>
  defHttp.post({
    url: `/login`,
    data,
  });

/**
 * 退出登录
 * @returns
 */
export const logout = () =>
  defHttp.get({
    url: `/logout`,
  });

/**
 * 获取用户信息
 * @returns
 */
export const getUserInfo = () =>
  defHttp.get(
    {
      url: `/users/me`,
    },
    {
      errorMessageMode: "none",
    }
  );

/**
 * 获取用户配置
 * @returns
 */
export const getUserConfig = () =>
  defHttp.get({
    url: `/get_conf`,
  });

/**
 * 更新用户配置
 * @param data
 * @returns
 */
export const updateUserConfig = (data: any) =>
  defHttp.post({
    url: `/update_conf`,
    data,
  });

/**
 * 用户订阅数据
 * @returns
 */
export const subscribe = (data: any) =>
  defHttp.post({
    url: `/sub`,
    data,
  });

/**
 * 获取用户订阅数据
 * @returns
 */
export const getSub = () =>
  defHttp.get({
    url: `/get_sub`,
  });

/**
 * 获取首页播客源列表
 * @returns
 */
export const getPodcastList = () =>
  defHttp.get({
    url: `/podcast`,
  });

/**
 * 生成播客源
 * @returns
 */
export const makePodcast = (data: any) =>
  defHttp.post({
    url: `/podcast_m`,
    data,
  });
