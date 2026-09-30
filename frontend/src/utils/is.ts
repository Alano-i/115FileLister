export {
  isArguments,
  isArrayBuffer,
  isArrayLike,
  isArrayLikeObject,
  isBuffer,
  isBoolean,
  isDate,
  isElement,
  isEmpty,
  isEqual,
  isEqualWith,
  isError,
  isFunction,
  isFinite,
  isLength,
  isMap,
  isMatch,
  isMatchWith,
  isNative,
  isNil,
  isNumber,
  isNull,
  isObjectLike,
  isPlainObject,
  isRegExp,
  isSafeInteger,
  isSet,
  isString,
  isSymbol,
  isTypedArray,
  isUndefined,
  isWeakMap,
  isWeakSet,
} from "lodash-es";
const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== "undefined";
}

// TODO 此处 isObject 存在歧义
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && is(val, "Object");
}

// TODO 此处 isArray 存在歧义
export function isArray(val: unknown): val is Array<unknown> {
  return Array.isArray(val);
}

export function isWindow(val: unknown): val is Window {
  return typeof window !== "undefined" && is(val, "Window");
}

export const isServer = typeof window === "undefined";

export const isClient = !isServer;

export function isHttpUrl(path: string): boolean {
  const reg = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/;
  return reg.test(path);
}

export function isPascalCase(str: string): boolean {
  const regex = /^[A-Z][A-Za-z]*$/;
  return regex.test(str);
}
