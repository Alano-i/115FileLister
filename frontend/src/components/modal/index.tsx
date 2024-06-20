import { Modal, Drawer } from "antd";
import * as React from "react";
import styled from "styled-components";
import { useIsMobile } from "/@/hooks/useIsMobile";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";

interface Props {
  visible: boolean;
  cancel: () => void;
  children: React.ReactNode;
  width?: number | string;
  placement?: "top" | "right" | "bottom" | "left";
  height?: number | string;
}

const BasicModal: React.FC<Props> = ({
  visible,
  cancel,
  children,
  height = "auto",
  width,
  placement = "bottom",
}) => {
  const { auth } = useStores();

  const isMobile = useIsMobile();

  if (!!isMobile)
    return (
      <StyledDraw
        open={visible}
        onClose={cancel}
        footer={null}
        closable={false}
        destroyOnClose
        width={width}
        height={height}
        placement={placement}
        $isDark={auth.isDark} // 传递是否为深色主题的布尔值
      >
        {children}
      </StyledDraw>
    );

  return (
    <StyledModal
      open={visible}
      onCancel={cancel}
      centered={true}
      footer={null}
      closable={false}
      destroyOnClose
      width={width}
      $isDark={auth.isDark} // 传递是否为深色主题的布尔值
    >
      {children}
    </StyledModal>
  );
};

const StyledModal = styled(Modal)<{ $isDark: boolean }>`
  /* 覆盖模态框内容的背景颜色 */
  .ant-modal-content {
    background-color: ${(props) =>
      props.$isDark ? "rgba(25, 26, 27, 0.8)" : "rgba(255, 255, 255, 0.92)"};
    transition: all 0.3s ease; /* 过渡效果 */
    box-shadow: inset 0 0 0 1px
        ${(props) =>
          props.$isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.1)"},
      /* 内描边 */ 0 20px 40px rgba(0, 0, 0, 0.1); /* 外部阴影 */
  }
  border-radius: 16px;
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);

  // mask-image: linear-gradient(black 80%, transparent);

  /* 如果要对模态框主体部分设置内描边或其他样式 */
  .ant-modal-body {
    /* 添加或覆盖样式 */
  }
`;

const StyledDraw = styled(Drawer)<{ $isDark: boolean }>`
  /* 覆盖模态框内容的背景颜色 */
  background-color: ${(props) =>
    props.$isDark
      ? "rgba(25, 26, 27, 0.85)"
      : "rgba(255, 255, 255, 0.9)"} !important;
  transition: all 0.3s ease; /* 过渡效果 */
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2); /* 外部阴影 */

  /* 设置内描边和阴影 */
  .ant-drawer-body {
    padding: 24px 16px;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
    border-radius: 16px 16px 0 0;
  }
  padding-bottom: env(safe-area-inset-bottom);
`;

export default observer(BasicModal);
