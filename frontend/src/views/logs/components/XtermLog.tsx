import { useEffect, useRef } from "react";
import { processAndHighlightLog } from "../utils";
import { LogLoader } from "../LogLoader";
import { Xterm } from "./Xterm/Xterm";

function XtermLog({ fontSize }: { fontSize: number }) {
  const xtermRef = useRef<{
    write: (data: string | Uint8Array) => void;
    clear: () => void;
  }>(null);

  const logBufferRef = useRef("");
  const logLoaderRef = useRef(
    new LogLoader({
      logUrl: "/api/get_log",
      wsUrl: "/ws/log_updates",
      onNewLogChunk: (chunk) => {
        const data = processAndHighlightLog(chunk);
        xtermRef.current?.write(data);
        logBufferRef.current += data;
      },
    })
  );

  useEffect(() => {
    logLoaderRef.current.startListening();

    return () => {
      logLoaderRef.current.stopListening();
    };
  }, []);

  return (
    <Xterm
      ref={xtermRef}
      style={{
        height: "100%",
        width: "100%",
        padding: "0",
        boxSizing: "border-box",
      }}
      options={{
        fontFamily: "Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace",
        fontSize,
        lineHeight: 1.4,
        convertEol: true,
        disableStdin: true,
        scrollback: 1000000,
      }}
    />
  );
}

export default XtermLog;
