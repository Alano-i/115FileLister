import { ConfigProvider } from "antd";
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "/@/layout/components/header";
import styled from "styled-components";
import zhCN from "antd/lib/locale/zh_CN";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";

const BasicLayout: React.FC = () => {
  const { auth } = useStores();

  return (
    <ConfigProvider locale={zhCN} theme={auth.theme}>
      <Content $color={auth.theme?.token?.colorTextBase}>
        <Header />
        <Outlet />
      </Content>
    </ConfigProvider>
  );
};

const Content = styled.div<{
  $color?: string;
}>`
  // max-width: 1280px;
  padding: 0 25px;
  margin: auto;
  color: ${(props) => props.$color};

  @media (min-width: 576px) and (max-width: 767px) {
    padding: 0 18px;
  }

  @media (min-width: 768px) and (max-width: 991px) {
    padding: 0 22px;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    padding: 0 25px;
  }

  @media (min-width: 1200px) {
    padding: 0 32px;
  }
  @media (max-width: 768px) {
    padding: 0 16px;
    padding-top: var(--safe-area-inset-top);
    padding-bottom: calc(70px + var(--safe-area-inset-bottom));
  }
`;

export default observer(BasicLayout);
