import { Flex } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useIsMobile } from "/@/hooks/useIsMobile";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";

const tabs = [
  {
    label: "播客源",
    value: "/",
    icon: "icon-podcast",
  },
  {
    label: "订阅",
    value: "/subscribe",
    icon: "icon-subscribe",
  },
  {
    label: "整理",
    value: "/arrange",
    icon: "icon-arrange",
  },
  {
    label: "日志",
    value: "/logs",
    icon: "icon-logs",
  },
  {
    label: "设置",
    value: "/settings",
    icon: "icon-settings",
  },
];

const Header: React.FC = () => {
  const [active, setActive] = useState<string>("/");

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const navigate = useNavigate();

  const location = useLocation();

  const { auth } = useStores();

  const isMobile = useIsMobile();

  const change = useCallback(
    (value: string, index: number) => {
      setActive(value);
      setActiveIndex(index * 92);
      navigate(value);
    },
    [setActive, setActiveIndex, navigate]
  );

  useEffect(() => {
    const index = tabs.findIndex(({ value }) => value === location.pathname);
    if (index !== -1) {
      setActive(tabs[index].value);
      setActiveIndex(index * 92);
    }
  }, []);

  return (
    <Content>
      <Flex justify="center" className="relative nav-flex">
        <Tabs $isDark={auth.isDark}>
          <TabContent>
            {!isMobile && <ActiveTabBackground x={activeIndex} />}
            {tabs?.map((row, index) => (
              <Tab
                $isDark={auth.isDark}
                onClick={() => change(row.value, index)}
                className={active === row.value ? "active" : undefined}
                key={row.value}
              >
                {!!isMobile && (
                  <div className="text-[31px]" style={{ lineHeight: "0" }}>
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref={`#${row.icon}`}></use>
                    </svg>
                  </div>
                )}
                {row.label}
              </Tab>
            ))}
          </TabContent>
        </Tabs>
      </Flex>
    </Content>
  );
};

const Content = styled.div`
  # 禁止元素被选中
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  padding: 30px 0 20px 0;
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    top: auto;
    padding: 0;
    width: 100vw;
  }
`;
const Tabs = styled.div<{
  $isDark: boolean;
}>`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  background-color: ${(props) =>
    props.$isDark ? "rgba(40, 39, 43, 0.75)" : "rgba(255, 255, 255, 0.75)"};
  border-radius: 26px;
  position: relative;
  color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"};
  font-size: 16px;
  box-shadow: 0px 6px 32px 0px
    ${(props) =>
      props.$isDark ? "rgba(13, 13, 13, 0.7)" : "rgba(0, 0, 0, 0.09)"};
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  transition: all 0.3s ease;

  .active {
    font-weight: 600;
    cursor: default;
    color: #ffffff;
    transition: all 0.3s ease;
    &:hover {
      color: ${(props) =>
        props.$isDark ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.99)"};
    }
  }

  // 内描边
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit; // 保持和父元素相同的边框半径
    pointer-events: none; // 确保伪元素不会阻止对真实元素的鼠标事件
    box-shadow: inset 0 0 0 1px
      ${(props) =>
        props.$isDark ? "rgba(255, 255, 255,0.05)" : "rgba(0, 0, 0, 0.09)"};
  }

  @media (max-width: 768px) {
    border-radius: 18px 18px 0px 0px;
    padding: 4px 0 10px 0;
    width: 100%;
    font-size: 11px;
    box-shadow: 0px -6px 24px 0px ${(props) => (props.$isDark ? "rgba(8, 8, 8, 0.35)" : "rgba(0, 0, 0, 0.12)")};

    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.25)"};
    .active {
      color: ${(props) =>
        props.$isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(87, 13, 248, 1)"};
      &:hover {
        color: ${(props) =>
          props.$isDark ? "rgba(255, 255, 255, 1)" : "rgba(87, 13, 248, 1)"};
      }
    }
    &::before {
      box-shadow: inset 0 1px 0 0
        ${(props) =>
          props.$isDark ? "rgba(255, 255, 255,0.05)" : "rgba(0, 0, 0, 0.10)"};
    }
  }
`;

const Tab = styled.div<{
  $isDark: boolean;
}>`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  width: 92px;
  height: 40px;
  display: flex;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  font-weight: 400;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;
  &:hover {
    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.75)"};
    text-shadow: 0px 0px 20px rgba(255, 255, 255, 0.2);
  }
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 2px;
  }
`;

// 根据活动 tab 的位置显示背景的样式组件
const ActiveTabBackground = styled.div<{
  x: number;
}>`
  transform: translateX(${(props) => props.x}px);
  position: absolute;
  width: 90px; // 与 Tab 组件的宽度一致
  height: 38px; // 与 Tab 组件的高度一致
  background-color: rgba(87, 13, 248, 1);
  border: 1px solid #633bd6;
  border-radius: 50px;
  transition: all 0.2s ease; // 添加位置切换的动画
  z-index: 10;
  top: 6px;
  left: 6px;
`;

const TabContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 52px;
  padding: 0 6px;
  @media (max-width: 768px) {
    padding: 0 6px;
    padding-bottom: calc(var(--safe-area-inset-bottom) - 10px);
    height: 62px;
  }
`;

export default observer(Header);
