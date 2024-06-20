import { Button, Col, Dropdown, Flex, MenuProps, Modal, Row } from "antd";
import * as React from "react";
import styled from "styled-components";
import Loading from "/@/components/loading";
import AddSubscribeModal from "./components/add-modal";
import ListenIcon from "/@/assets/svg/listen.svg";
import AddIcon from "/@/assets/svg/add.svg";
import { useIsMobile } from "/@/hooks/useIsMobile";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import { getSub, subscribe } from "/@/api";
import { useMessage } from "/@/hooks/useMessage";

interface dataType {
  cover_url: string;
  book_title: string;
  author: string;
  reader: string;
  album_id: string;
  xmly_url: string;
}
const Subscribe: React.FC = () => {
  const [data, setData] = React.useState<Array<dataType>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [addVisible, setAddVisible] = React.useState<boolean>(false);
  const [editRow, setEdit] = React.useState<dataType | undefined>();
  const { auth } = useStores();
  const isMobile = useIsMobile();
  const { success } = useMessage();

  const fetch = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSub();
      // console.log('订阅信息:',res)
      const data = [];
      for (const key in res as any) {
        if (key) {
          data.push({
            album_id: key,
            ...(res as any)[key],
          });
        }
      }
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetch();
  }, []);

  const cancel = React.useCallback(() => {
    setAddVisible(false);
    setEdit(undefined);
  }, []);

  const handleSuccess = () => {
    success("订阅成功");
    fetch();
    setAddVisible(false);
  };

  const actions: MenuProps["items"] = [
    {
      key: "edit",
      label: "编辑",
      icon: <EditOutlined />,
    },
    {
      key: "refresh",
      label: "检查更新",
      icon: <PlayCircleOutlined />,
    },
    {
      key: "remove",
      label: "删除",
      icon: <DeleteOutlined />,
    },
  ];
  const handleMenuClick = async ({ key }: { key: string }, item: dataType) => {
    switch (key) {
      case "edit":
        setEdit(item);
        setAddVisible(true);
        break;
      case "remove":
        Modal.confirm({
          title: "删除订阅",
          content: `确定删除【${item?.book_title}】订阅`,
          okText: "确定",
          cancelText: "取消",
          centered: true, // 设置为 true 居中显示
          // style: { backgroundColor: "red" },
          onOk: async () => {
            try {
              await subscribe({
                remove: true,
                ...item,
              });
              success("删除成功");
              fetch();
            } catch (error) {}
          },
        });
        break;
    }
  };

  return (
    <Content>
      <Header justify="space-between" align="center" className="h-[68px] border-b" $isDark={auth.isDark}>
        <div
          className={`${isMobile ? "text-[22px]" : "text-[18px]"}
          } font-bold shadow-none rounded-[80px]`}>
          订阅列表
        </div>
        <Button
          type="primary"
          className={`flex items-center justify-center ${
            isMobile ? "w-[40px]" : "w-[40px]"
          } ${isMobile ? "h-[40px]" : "h-[40px]"} shadow-none rounded-[80px]`}
          size="large"
          onClick={() => setAddVisible(true)}
        >
          <img className="h-[16px]" src={AddIcon} />
        </Button>
      </Header>
      <Row className="book_list mt-[20px]" gutter={20}>
        {data?.map((item) => (
          <Col
            className="mb-[20px] min-w-[343px]"
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            key={item.album_id}
          >
            <Card
              $isDark={auth.isDark}
              className="flex items-center gap-[10px] rounded-[15px]"
            >
              <div className="p-[5px]">
                <ImageCover
                  className="w-[100px] h-[100px]  rounded-[10px] overflow-hidden"
                  $url={item.cover_url}
                />
              </div>

              <Flex className="flex-1" vertical={true} gap={"5px"}>
                <Title
                  $color={auth.theme?.token?.colorTextBase}
                  className="text-[15px] flex justify-between items-start pr-[16px] gap-[5px]"
                >
                  {item.book_title}
                  <Dropdown
                    menu={{
                      items: actions,
                      onClick: (e) => handleMenuClick(e, item),
                    }}
                    trigger={["click"]}
                  >
                    <EllipsisOutlined />
                  </Dropdown>
                </Title>
                <Title
                  $color={auth.theme?.token?.colorTextTertiary}
                  className="text-[12px]  mb-[15px]"
                >
                  {item.author} · {item.reader}
                </Title>

                <div className="text-[12px] flex items-center gap-[4px] text-[#ffffff7f]">
                  <img src={ListenIcon} />
                  <a
                    href={item.xmly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.album_id}
                  </a>
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
        <div className="w-full flex items-center justify-center">
          <Loading visible={loading} />
        </div>
        {addVisible && (
          <AddSubscribeModal
            success={handleSuccess}
            cancel={cancel}
            visible={addVisible}
            editRow={editRow}
          />
        )}
      </Row>
    </Content>
  );
};

const Content = styled.div`
  max-width: 800px;
  margin: auto;
  .add {
    background-color: rgba(87, 13, 248, 1);
    color: #ffffff;
    border-color: rgba(87, 13, 248, 1);
    height: 38px;
    width: 96px;
    border-radius: 8px;
    font-size: 15px;
    &:hover {
      background-color: rgba(87, 13, 248, 1) !important;
      border-color: rgba(87, 13, 248, 1) !important;
      color: #ffffff !important;
    }
  }
  .book_list {
    opacity: 0;
    transform: translateY(100px);
    animation: book_list 0.3s ease-out forwards;
  }

  @keyframes book_list {
    from {
      opacity: 1;
      transform: translateY(30px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageCover = styled.div<{
  $url: string;
}>`
  position: relative;
  background-image: url(${(props) => props.$url});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::after {
    content: "";
    display: block;
    border-radius: 10px;
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    box-shadow: inset 0px 0px 0px 1px rgb(255 255 255 / 12%);
  }
`;

const Card = styled.div<{ $isDark: boolean }>`
  background-color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)"};
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    background-color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  }
  a {
    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"};
    transition: color 0.3s ease;
    &:hover {
      color: ${(props) =>
        props.$isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"};
    }
  }
`;

const Title = styled.div<{
  $color?: string;
}>`
  color: ${(props) => props.$color};
`;

const Header = styled(Flex)<{
  $isDark: boolean;
}>`
  border-bottom: 0.5px solid
    ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.08)"};
`;

export default observer(Subscribe);
