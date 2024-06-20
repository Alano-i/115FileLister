import * as React from "react";
import XtermLog from "./components/XtermLog";
import { useState } from "react";
import styled from "styled-components";
import { useIsMobile } from "/@/hooks/useIsMobile";

const Logs: React.FC = () => {
  const isMobile = useIsMobile();
  // 设置默认字体大小
  const [fontSize, setFontSize] = useState(isMobile ? 8 : 11);

  // 监听 isMobile 的变化并更新 fontSize
  React.useEffect(() => {
    setFontSize(isMobile ? 8 : 11);
  }, [isMobile]); // 依赖列表中包含 isMobile

  return (
    <Content>
      <LogContent>
        <div>
          字体大小：
          <button
            className="w-[24px] h-[24px] rounded-full bg-gray-400 hover:bg-gray-300 cursor-pointer border-none mr-[8px]"
            onClick={() => setFontSize((prev) => prev - 1)}
          >
            -
          </button>
          <span>{fontSize}</span>
          <button
            className="w-[24px] h-[24px] rounded-full bg-gray-400 hover:bg-gray-300 cursor-pointer border-none ml-[8px]"
            onClick={() => setFontSize((prev) => prev + 1)}
          >
            +
          </button>
        </div>
      </LogContent>
      <div className="flex-1">
        <XtermLog fontSize={fontSize}/>
      </div>
    </Content>
  );
};

const Content = styled.div`
  position: absolute;
  inset: 0;
  color: #ffffff9f;
  top: 80px;
  bottom: 50px;
  display: flex;
  flex-direction: column;
`;

const LogContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  font-size: 12px;
`;

export default Logs;
