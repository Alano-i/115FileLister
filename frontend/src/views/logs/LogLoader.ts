type LogLoaderOptions = {
  logUrl: string;
  wsUrl: string;
  onNewLogChunk: (chunk: string) => void;
};

export class LogLoader {
  private logUrl: string;
  private wsUrl: string;
  private start: number = 0;
  private ws: WebSocket | null = null;
  private onNewLogChunk: (chunk: string) => void;
  private buffer: Uint8Array = new Uint8Array(0);

  constructor(options: LogLoaderOptions) {
    this.logUrl = options.logUrl;
    this.wsUrl = options.wsUrl;
    this.onNewLogChunk = options.onNewLogChunk;

    // 初始化时加载初始区块
    this.loadInitialChunks();
  }

  private fetchLogChunk(): Promise<ArrayBuffer> {
    // 下一个区块的范围
    const start = this.start;

    const headers = new Headers({
      Range: `bytes=${start}-`,
    });

    return fetch(this.logUrl, { headers })
      .then((response) => {
        if (!response.ok) {
          // 检查是否是416错误
          if (response.status === 416) {
            console.log("请求的范围无法满足");
            return new ArrayBuffer(0); // 返回一个空的ArrayBuffer
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentLength = response.headers.get("Content-Length");
        if (contentLength) {
          this.start += parseInt(contentLength, 10);
        }

        return response.arrayBuffer();
      })
      .then((data) => {
        return data;
      });
  }

  private processChunk(data: ArrayBuffer): void {
    // 将新数据追加到现有缓冲区
    let newData = new Uint8Array(data);
    let combinedData = new Uint8Array(this.buffer.length + newData.length);
    combinedData.set(this.buffer);
    combinedData.set(newData, this.buffer.length);
    this.buffer = combinedData;

    // 将缓冲区中的数据转换为字符串
    let textDecoder = new TextDecoder();
    let text = textDecoder.decode(this.buffer, { stream: true });

    // 查找最后一个换行符
    let lastNewlineIndex = text.lastIndexOf("\n");
    if (lastNewlineIndex === -1) {
      return; // 如果没有换行符，则保持当前缓冲区不变
    }

    // 获取完整的日志条目
    let completeLogEntries = text.slice(0, lastNewlineIndex + 1);

    // 使用回调函数处理完整的日志条目
    this.onNewLogChunk(completeLogEntries);

    // 更新缓冲区，移除已处理的数据
    this.buffer = this.buffer.slice(new TextEncoder().encode(completeLogEntries).length);
  }

  public loadInitialChunks(): Promise<void> {
    return this.fetchLogChunk()
      .then((data) => {
        this.processChunk(data);
      })
      .catch((error) => console.error("Error fetching initial log chunk:", error));
  }

  private onWsMessage = (event: MessageEvent) => {
    console.log("WebSocket message:", event.data);
    if (event.data === "Log file has been modified.") {
      this.fetchLogChunk()
        .then((data) => {
          if (data) {
            this.processChunk(data);
          }
        })
        .catch((error) => console.error("Error fetching new log chunk:", error));
    }
  };

  public startListening(): void {
    this.ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${
        this.wsUrl
      }`
    );
    this.ws.onopen = () => {
      console.log("WebSocket 连接已打开");
    };
    this.ws.onmessage = this.onWsMessage;
    this.ws.onerror = (error) => {
      console.error("WebSocket 错误:", error);
    };
    this.ws.onclose = (event) => {
      if (event.wasClean) {
        console.log("WebSocket 连接关闭");
      } else {
        console.log("WebSocket 连接断开");
      }
    };
  }

  public stopListening(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
