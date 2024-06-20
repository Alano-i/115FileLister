import Prism from "prismjs";
import "prismjs/components/prism-log";

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 时间间隔（毫秒）
 * @returns {Function}
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...funcArgs: Parameters<T>) => void {
  let lastFunc: number | undefined;
  let lastRan: number | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this;

    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = window.setTimeout(() => {
        if (Date.now() - (lastRan as number) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - (lastRan as number)));
    }
  };
}

// 文件分块加载 通过一个回调函数来处理每一块的数据
export const fetchArticleInChunks = async (
  url: RequestInfo | URL,
  callback: (arg0: Uint8Array, arg1: number, arg2: string | null) => void
) => {
  const response = await fetch(url);
  const reader = response.body?.getReader();
  let receivedLength = 0; // 已接收长度
  let chunks = []; // 数据块

  if (!reader) {
    return;
  }

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    // 每接收到一个 chunk 就执行一次回调函数
    callback(value, receivedLength, response.headers.get("Content-Length"));
  }

  // 将所有数据块拼接成一个 Uint8Array
  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;

  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  return chunksAll;
};

// 用于转换十六进制颜色为 ANSI escape code
export function hexToAnsi16m(hex: string): string {
  // 校验并标准化十六进制颜色代码
  if (hex.startsWith("#")) {
    hex = hex.substring(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6) {
    throw new Error("Invalid hex color code");
  }

  // 将十六进制颜色转换为 RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 构建并返回 ANSI escape code
  return `\x1b[38;2;${r};${g};${b}m`;
}

// 将 tokens 转换为 ANSI escape codes
function tokensToAnsi(tokens: any[]) {
  const ansi_mapping: {
    [key: string]: string;
  } = {
    hash: hexToAnsi16m("#6e995c"),
    url: hexToAnsi16m("#6e995c"),
    reason: hexToAnsi16m("#6e995c"),
    domain: hexToAnsi16m("#6e995c"),
    string: hexToAnsi16m("#909e6a"),
    punctuation: hexToAnsi16m("#909e6a"),
    separator: hexToAnsi16m("#909e6a"),
    boolean: hexToAnsi16m("#909e6a"),
    warning: hexToAnsi16m("#c7a24d"),
    property: hexToAnsi16m("#dc5229"),
    special: hexToAnsi16m("#dc5229"),
    operator: hexToAnsi16m("#999999"),
    date: hexToAnsi16m("#4782b3"),
    time: hexToAnsi16m("#4782b3"),
    number: hexToAnsi16m("#4782b3"),
    "ip-address": hexToAnsi16m("#4782b3"),
    "file-path": hexToAnsi16m("#4782b3"),
    site: hexToAnsi16m("#999999"),
    "level.ERROR": hexToAnsi16m("#dc5229"),
    "level.INFO": hexToAnsi16m("#666666"),
    "level.DEBUG": hexToAnsi16m("#666666"),
  };
  return tokens
    .map((token) => {
      if (typeof token === "string") {
        return `${hexToAnsi16m("#999999")}${token}\x1b[0m`
      } else {
        let key = token.type;
        if (key === "level") {
          key = `${key}.${token.content}`;
        }
        const colorCode = ansi_mapping[key] || "";
        if (colorCode === "") {
          console.warn(`No color mapping for token type "${key}"`);
        }
        return colorCode + token.content + "\x1b[0m"; // \x1b[0m 用于重置颜色
      }
    })
    .join("");
}

// 用于处理日志并高亮
export function processAndHighlightLog(logData: string) {
  const lines = logData.split("\n");
  return lines
    .map((line: any) => {
      const tokens = Prism.tokenize(line, Prism.languages.log);
      return tokensToAnsi(tokens);
    })
    .join("\n");
}
