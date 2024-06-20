import * as React from "react";
import styled from "styled-components";
import useStores from "/@/hooks/useStores";

interface Props {
  visible: boolean;
}

const Loading: React.FC<Props> = ({ visible }) => {
  const { auth } = useStores(); // 使用 useStores 钩子
  return visible ? (
    <LoadingWrapper $isDark={auth.isDark}>
      <LoadingContent $isDark={auth.isDark} />
      <p className="loading-text text-[14px] opacity-[0.5] mt-[8px]">
        加载中，请稍候
      </p>
    </LoadingWrapper>
  ) : null;
};

const LoadingWrapper = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LoadingContent = styled.div<{ $isDark: boolean }>`
  text-align: center;
  width: 30px;
  height: 30px;
  border: 2px solid ${(props) => (props.$isDark ? "#fff" : "#570DF8")};
  border-top-color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"};
  border-right-color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"};
  border-bottom-color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"};
  border-radius: 100%;
  animation: circle infinite 0.75s linear;
  @keyframes circle {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loading;
