import { afterEach, describe, expect, it, vi } from "vitest";
import axios, { AxiosError, type AxiosAdapter } from "axios";
import { defHttp } from "./index";
import { VAxios } from "./Axios";

const response: AxiosAdapter = async (config) => ({
  data: [{ path: "/folder" }],
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

afterEach(() => vi.unstubAllGlobals());

describe("HTTP 请求及错误处理", () => {
  it("返回文件列表并保留查询参数", async () => {
    const adapter = vi.fn(response);
    const data = await defHttp.get({ url: "/list", params: { path: "/folder" }, adapter });
    expect(data).toEqual([{ path: "/folder" }]);
    expect(adapter.mock.calls[0][0].params).toMatchObject({ path: "/folder" });
  });

  it("支持返回原始响应", async () => {
    const result = await defHttp.get({ url: "/list", adapter: response }, { isReturnNativeResponse: true });
    expect(result).toMatchObject({ status: 200, data: [{ path: "/folder" }] });
  });

  it("没有请求配置的错误不会被二次异常覆盖", async () => {
    const error = new AxiosError("没有请求配置");
    await expect(defHttp.get({ url: "/list", adapter: async () => { throw error; } })).rejects.toBe(error);
  });

  it("普通错误和取消请求原样传递", async () => {
    for (const error of [new Error("失败"), new axios.CanceledError("已取消")]) {
      await expect(defHttp.get({ url: "/list", adapter: async () => { throw error; } })).rejects.toBe(error);
    }
  });

  it("网络错误可重试 GET，保留认证头并返回重试成功的结果", async () => {
    let attempts = 0;
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      attempts += 1;
      if (attempts === 1) throw new AxiosError("Network Error", "ERR_NETWORK", config);
      return response(config);
    });
    const result = await defHttp.get({ url: "/list", headers: { Authorization: "Bearer test" }, adapter }, {
      retryRequest: { isOpenRetry: true, count: 1, waitTime: 0 },
    });
    expect(result).toEqual([{ path: "/folder" }]);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(adapter.mock.calls[1][0].headers.get("Authorization")).toBe("Bearer test");
  });

  it("重试达到上限后拒绝，默认不重试 POST", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => { throw new AxiosError("Network Error", "ERR_NETWORK", config); });
    const options = { retryRequest: { isOpenRetry: true, count: 2, waitTime: 0 } };
    await expect(defHttp.get({ url: "/list", adapter }, options)).rejects.toThrow("Network Error");
    expect(adapter).toHaveBeenCalledTimes(3);
    adapter.mockClear();
    await expect(defHttp.post({ url: "/list", adapter }, options)).rejects.toThrow("Network Error");
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it("文件上传通过请求选项控制取消行为，而不是发送伪 HTTP 头", async () => {
    vi.stubGlobal("window", { FormData });
    const client = new VAxios({});
    const adapter = vi.fn(response);
    await client.uploadFile({ url: "/upload", adapter }, {
      file: new Blob(["test"]), filename: "test.txt", data: { name: "test", tags: ["one", "two"] },
    });
    const config = adapter.mock.calls[0][0];
    expect(config.requestOptions?.ignoreCancelToken).toBe(true);
    expect(config.headers.has("ignoreCancelToken")).toBe(false);
    expect(config.data.getAll("tags[]")).toEqual(["one", "two"]);
  });
});
