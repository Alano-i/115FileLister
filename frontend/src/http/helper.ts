import { isObject, isString } from "/@/utils/is";

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T
): T extends true ? string : object;

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? "" : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/**
 * @description: Format request parameter time
 */
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== "[object Object]") {
    return;
  }

  for (const key in params) {
    const value = params[key];
    if (isObject(value) && typeof value.format === "function") {
      params[key] = value.format(DATE_TIME_FORMAT);
    }
    if (isString(key)) {
      const value = params[key];
      if (value) {
        params[key] = isString(value) ? value.trim() : value;
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}
