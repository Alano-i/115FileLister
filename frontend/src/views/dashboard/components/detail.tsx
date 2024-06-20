import { Button } from "antd";
import * as React from "react";
import styled from "styled-components";
import CopyIcon from "/@/assets/svg/copy.svg";
import PodcastIcon from "/@/assets/svg/podcast.svg";
import OpenIcon from "/@/assets/svg/open.svg";
import ReaderIcon from "/@/assets/svg/reader.svg";
import TingIcon from "/@/assets/svg/ting.svg";
import BasicModal from "/@/components/modal";
import { useIsMobile } from "/@/hooks/useIsMobile";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import { useMessage } from "/@/hooks/useMessage";

interface Props {
  visible: boolean;
  cancel: () => void;
  success: () => void;
  editRow?: any;
}

const DetailModal: React.FC<Props> = ({ visible, cancel, editRow }) => {
  const { auth } = useStores();
  const isMobile = useIsMobile();
  const { error, success } = useMessage();
  return (
    <BasicModal visible={visible} cancel={cancel} width={340}>
      <LineStyle $isDark={auth.isDark}>
        <div className="flex flex-col gap-[4px]  pt-[8px] text-center">
          <Img className="w-[80px] mx-auto h-[80px] rounded-[40px] overflow-hidden">
            <img
              className="w-full rounded-[40px] overflow-hidden"
              src={editRow?.cover_url}
            />
          </Img>
          <TextStyle $isDark={auth.isDark}>
            <div className="title_text text-[19px] py-[8px] font-bold">
              {editRow?.book_title}
            </div>
            <div className="content_text flex items-center justify-center text-[14px] pb-[8px]">
              <div>
                {editRow?.author} · {editRow?.reader}
              </div>
              <img className="pl-[4px]" src={ReaderIcon} />
            </div>
            {editRow?.sync_time && editRow?.update_time && (
              <div className="w-full content_text opacity-[0.5] flex items-center justify-center text-[11px] pb-[12px]">
                <div>
                  {editRow.sync_time} 同步 / {editRow.update_time} 更新
                </div>
              </div>
            )}
          </TextStyle>
        </div>
      </LineStyle>

      <div className="flex flex-col pb-[16px]">
        <ButtonStyle $isDark={auth.isDark}>
          <div className="flex justify-center py-[24px] items-center gap-[56px] self-stretch">
            {editRow?.xmly_url && (
              <Button
                type="primary"
                className={`flex items-center justify-center ${
                  isMobile ? "w-[50px]" : "w-[44px]"
                } ${
                  isMobile ? "h-[50px]" : "h-[44px]"
                } shadow-none rounded-[80px]`}
                size="large"
                onClick={() => window.open(editRow?.xmly_url, "_blank")}
              >
                <img className="bt-img h-[17.5px] opacity-[0.5]" src={TingIcon} />
              </Button>
            )}

            <Button
              type="primary"
              className={`flex items-center justify-center ${
                isMobile ? "w-[50px]" : "w-[44px]"
              } ${
                isMobile ? "h-[50px]" : "h-[44px]"
              } shadow-none rounded-[80px]`}
              size="large"
              onClick={() => window.open(editRow?.podcast_url, "_blank")}
            >
              <img className="bt-img opacity-[0.5] h-[17px]" src={OpenIcon} />
            </Button>
            <Button
              type="primary"
              className={`flex items-center justify-center ${
                isMobile ? "w-[50px]" : "w-[44px]"
              } ${
                isMobile ? "h-[50px]" : "h-[44px]"
              } shadow-none rounded-[80px]`}
              size="large"
              onClick={() => {
                navigator.clipboard
                  .writeText(editRow?.podcast_url)
                  .then(() => {
                    success("已复制到剪贴板");
                  })
                  .catch(() => {
                    error("复制失败");
                  });
              }}
            >
              <img className="bt-img h-[17px]  opacity-[0.5]" src={CopyIcon} />
            </Button>
          </div>
        </ButtonStyle>

        <Button
          type="primary"
          className={`flex items-center justify-center px-[10px] w-full ${
            isMobile ? "h-[50px]" : "h-[44px]"
          } shadow-none rounded-[8px] text-[16px]`}
          size="large"
          onClick={() => {
            window.location.href = "podcast:" + editRow?.podcast_url;
          }}
        >
          <img className="pr-[8px]" src={PodcastIcon} />
          <span>在</span>
          <span className="px-[4px]">播客</span>
          中打开
        </Button>
      </div>
    </BasicModal>
  );
};

export default observer(DetailModal);

const Img = styled.div`
  position: relative;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.2);
  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    border-radius: 40px; // 保持和图片相同的边框半径
    pointer-events: none; // 确保伪元素不会阻止对真实元素的鼠标事件
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1); // 调整这里的颜色和大小以符合你的设计
    z-index: 1;
  }
`;

const TextStyle = styled.div<{ $isDark: boolean }>`
  .title_text {
    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.8)"};
  }
  .content_text {
    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.75)"};
  }
`;

const LineStyle = styled.div<{ $isDark: boolean }>`
  border-bottom: 0.5px solid
    ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.09)"};
`;

const ButtonStyle = styled.div<{ $isDark: boolean }>`
  transition: all 0.3s ease;
  .ant-btn {
    background: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 1)"};
  }
  .ant-btn-primary:not(:disabled):not(.ant-btn-disabled):hover {
    background: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.9)" : "#570DF8"};
  }
  .ant-btn-primary:not(:disabled):not(.ant-btn-disabled):hover .bt-img {
    filter: ${(props) => (props.$isDark ? "invert(1)" : "invert(0)")};
    opacity: 0.99;
  }
  .bt-img {
    filter: ${(props) => (props.$isDark ? "invert(0)" : "invert(1)")};
    opacity: ${(props) => (props.$isDark ? "0.5" : "0.8")};
  }
`;
