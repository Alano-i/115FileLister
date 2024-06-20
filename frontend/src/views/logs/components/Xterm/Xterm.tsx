import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { CanvasAddon } from "xterm-addon-canvas";
import { WebglAddon } from "xterm-addon-webgl";
import { ISearchOptions, SearchAddon } from "xterm-addon-search";
import { throttle } from "../../utils";
import "xterm/css/xterm.css";
import "./xterm.css";

export const Xterm = forwardRef(
  (
    {
      options,
      ...rest
    }: {
      options: ITerminalOptions & ITerminalInitOnlyOptions;
    } & React.HTMLAttributes<HTMLDivElement>,
    ref
  ) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermInstance = useRef<Terminal | null>(null);
    const requestAnimationFrameRef = useRef<number | null>(null);
    const searchAddonRef = useRef<SearchAddon | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }

      if (!xtermInstance.current) {
        const xterm = new Terminal(options);

        const fitAddon = new FitAddon();
        const canvasAddon = new CanvasAddon();
        const webglAddon = new WebglAddon();
        const webLinksAddon = new WebLinksAddon();
        const searchAddon = new SearchAddon();

        searchAddonRef.current = searchAddon;
        fitAddonRef.current = fitAddon;

        xterm.loadAddon(fitAddon);
        xterm.loadAddon(canvasAddon);
        xterm.loadAddon(webglAddon);
        xterm.loadAddon(webLinksAddon);
        xterm.loadAddon(searchAddon);

        xtermInstance.current = xterm;

        if (terminalRef.current) {
          xtermInstance.current.open(terminalRef.current);
        }
      }

      const throttledFit = throttle(() => {
        try {
          fitAddonRef.current?.fit();
        } catch (err) {
          console.error(err);
        }
      }, 300);

      const resizeObserver = new ResizeObserver(() => {
        throttledFit();
      });

      if (terminalRef.current) {
        throttledFit();
        resizeObserver.observe(terminalRef.current);
      }

      return () => {
        requestAnimationFrameRef.current = requestAnimationFrame(() => {
          console.log("Xterm: Disposing");
          resizeObserver.disconnect();
          xtermInstance.current?.dispose();
          xtermInstance.current = null;
        });
      };
    }, []);

    useEffect(() => {
      if (xtermInstance.current) {
        xtermInstance.current.options.fontSize = options.fontSize;
        fitAddonRef.current?.fit();
      }
    }, [options.fontSize]);

    useImperativeHandle(ref, () => ({
      write: (data: string | Uint8Array) => {
        xtermInstance.current?.write(data);
      },
      clear: () => {
        xtermInstance.current?.clear();
      },
      findNext: (term: string, searchOptions?: ISearchOptions) => {
        searchAddonRef.current?.findNext(term, searchOptions);
      },
    }));

    return (
      <div {...rest}>
        <div
          style={{
            height: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          <div
            className="buttom-group"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              onClick={() => {
                xtermInstance.current?.scrollToTop();
              }}
              className="button"
            >
              ⬆️
            </div>
            <div
              onClick={() => {
                searchAddonRef.current?.findNext("ERROR");
              }}
              className="button"
            >
              🔍
            </div>
            <div
              onClick={() => {
                xtermInstance.current?.scrollToBottom();
              }}
              className="button"
            >
              ⬇️
            </div>
          </div>
          <div
            ref={terminalRef}
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
            }}
          />
          ;
        </div>
      </div>
    );
  }
);
