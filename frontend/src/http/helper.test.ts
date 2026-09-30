import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { formatRequestDate } from "./helper";
import { isArray, isObject } from "/@/utils/is";

describe("请求参数类型收窄", () => {
  it("保留日期格式化、字符串去空格和嵌套对象处理", () => {
    const params: Recordable = { date: dayjs("2024-01-02T03:04:05"), name: " name ", nested: { text: " value " }, empty: null };
    formatRequestDate(params);
    expect(params).toEqual({ date: "2024-01-02 03:04:05", name: "name", nested: { text: "value" }, empty: null });
  });

  it("数组和对象检查对空值返回 false", () => {
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray([])).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject({})).toBe(true);
  });
});
