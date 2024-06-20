// import { SearchOutlined } from "@ant-design/icons";
import { Row, Image, Input, Col } from "antd";
import * as React from "react";
import styled from "styled-components";
import { Waypoint } from "react-waypoint";
import Loading from "/@/components/loading";
import useRandomId from "/@/hooks/useRandomId";
import DetailModal from "./components/detail";
import ReaderIcon from "/@/assets/svg/reader.svg";
import BarsIcon from "/@/assets/svg/bars.svg";
import SearchIcon from "/@/assets/svg/search.svg";
import { useIsMobile } from "/@/hooks/useIsMobile";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import { getPodcastList } from "/@/api";
import { useMessage } from "/@/hooks/useMessage";

interface dataType {
  id: string;
  cover_url: string;
  book_title: string;
  audio_num: number;
  author: string;
  reader: string;
  sub: boolean;
}

const DEFAULT_SIZE = 30;

const Dashboard: React.FC = () => {
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<Array<dataType>>([]);
  const [searchData, setSearchData] = React.useState<Array<dataType>>([]);
  const [searchText, setSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [tableData, setTable] = React.useState<Array<dataType>>([]);
  const { auth } = useStores();
  const [visible, setVisible] = React.useState<boolean>(false);
  const [editRow, setEdit] = React.useState<dataType | undefined>();
  const isMobile = useIsMobile();
  const inputRef = React.useRef<HTMLDivElement | null>(null);
  const { success } = useMessage();

  /**
   * 判断是否加载 “更多” 组件
   */
  const allowLoadMore = React.useMemo(
    () => page * DEFAULT_SIZE < total,
    [page, total]
  );

  /**
   * 加载更多
   */
  const loadMore = React.useCallback(() => {
    if (loading || !allowLoadMore) return;
    const current = page + 1;
    setLoading(true);
    const _arr = [...data].slice(
      page * DEFAULT_SIZE,
      page * DEFAULT_SIZE + DEFAULT_SIZE
    );
    setTimeout(() => {
      setLoading(false);
      setTable([...tableData, ..._arr]);
      setPage(current);
    }, 1 * 1);
  }, [page, allowLoadMore, loading, data]);

  function convertJSONToArray(jsonData: any): dataType[] {
    const resultArray: dataType[] = [];
    const titles = Object.keys(jsonData);
    titles.forEach((title) => {
      const authors = Object.keys(jsonData[title]);
      authors.forEach((author) => {
        const studios = Object.keys(jsonData[title][author]);
        studios.forEach((studio) => {
          const info = jsonData[title][author][studio];
          const id = useRandomId();
          const podcastInfo: dataType = {
            id,
            book_title: title,
            author: author,
            reader: studio,
            ...info,
          };
          resultArray.push(podcastInfo);
        });
      });
    });
    return resultArray;
  }

  const fetch = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPodcastList();
      const arr = convertJSONToArray(res);
      setData(arr);
      setSearchData(arr);
      setTotal(arr?.length);
      setTable([...arr].slice(0, 30));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [searchText, page]);

  React.useEffect(() => {
    fetch();
  }, []);

  // 详情弹窗
  const cancel = React.useCallback(() => {
    setVisible(false);
    setEdit(undefined);
  }, []);

  const handleSuccess = () => {
    success("订阅成功222");
    fetch();
    setVisible(false);
  };

  const showDetail = (detail_info: dataType) => {
    setVisible(true);
    setEdit(detail_info);
  };

  const search = () => {
    try {
      setLoading(true);
      setTable([]);
      setPage(1);
      setTotal(0);
      if (!searchText) {
        setTimeout(() => {
          setTable([...data].slice(0, 30));
          setLoading(false);
          setTotal(data?.length);
        }, 500);
        return;
      }
      const _data =
        searchData?.filter(
          ({ book_title, author, reader }) =>
            book_title.indexOf(searchText) !== -1 ||
            author.indexOf(searchText) !== -1 ||
            reader.indexOf(searchText) !== -1
        ) || [];
      setTimeout(() => {
        setTable(_data);
        setLoading(false);
        setTotal(_data?.length);
      }, 1 * 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Content $isDark={auth.isDark}>
      <div className="text-[22px] font-bold mt-[10px] mb-3px">共 {total} 个播客源</div>
      <Text
        className="mt-30px"
        $color={auth.theme?.token?.colorTextPlaceholder}
      >
        在 Safari 中打开，点击封面可快速添加至 Apple 播客 App 中
      </Text>
      <InputContent ref={inputRef}>
        <div className="relative">
          <SearchAddonBefore>
            <img src={SearchIcon} />
          </SearchAddonBefore>
          <Input
            className="search"
            placeholder="搜索书名、作者、演播者"
            onPressEnter={search}
            value={searchText}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchAddon
            $isDark={auth.isDark}
            className={`cursor-pointer ${isMobile ? "px-[20px]" : "px-[34px]"}`}
            onClick={search}
          >
            搜索
          </SearchAddon>
          {/* {isMobile && <SearchAddon onClick={search}>搜索</SearchAddon>} */}
        </div>
      </InputContent>

      <Row
        className="mt-[30px] book_list"
        gutter={{ xs: 10, sm: 18, md: 25, lg: 32 }}
      >
        {tableData?.map((item) => (
          <Col
            className="flex flex-col mb-[32px]"
            xs={12}
            md={8}
            lg={6}
            xl={4}
            xxl={3}
            key={item.id}
          >
            <ImageWrapper>
              <Image
                className="w-full rounded-[14px] overflow-hidden cursor-pointer"
                src={item.cover_url}
                preview={false}
                loading="lazy"
                onClick={() => showDetail(item)}
              />
            </ImageWrapper>
            <div className="flex items-center  justify-center gap-[5px] text-[15px] mt-[8px]">
              {item.book_title}
              {item.sub && <img className="h-[14px]" src={BarsIcon} />}
            </div>

            <div className="text-[12px] pt-[4px] pb-[4px] opacity-[0.5]">
              共 {item.audio_num} 集 · {item.author}
            </div>
            <div className="text-[12px] flex items-center gap-[4px] justify-center">
              <div className="opacity-[0.5]">{item.reader}</div>
              <img src={ReaderIcon} />
            </div>
          </Col>
        ))}
      </Row>
      <Loading visible={loading} />
      {!!allowLoadMore && <Waypoint key={data.length} onEnter={loadMore} />}
      {/* 详情 */}
      {visible && (
        <DetailModal
          success={handleSuccess}
          cancel={cancel}
          visible={visible}
          editRow={editRow}
        />
      )}
    </Content>
  );
};

const Content = styled.div<{ $isDark: boolean }>`
  text-align: center;
  .search {
    border-radius: 25px;
    padding: 12px 17px 12px 41px;
    border: none;
    color: ${(props) =>
      props.$isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)"};
    background-color: ${(props) =>
        props.$isDark ? "rgba(40, 40, 40, 0.80)" : "rgba(225, 225, 229, 0.75)"};
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    &:focus,
    &:hover {
      box-shadow: none;
    }
  }
  .book_list {
    opacity: 0;
    transform: translateY(100px);
    animation: book_list 0.35s ease-out forwards;
  }

  @keyframes book_list {
    from {
      opacity: 1;
      transform: translateY(100px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Text = styled.div<{ $color?: string }>`
  color: ${(props) => props.$color};
  font-size: 15px;
  margin-top: 8px;
  margin-bottom: 20px;

  @media (max-width: 575px) {
    font-size: 12px;
  }

  @media (min-width: 576px) and (max-width: 767px) {
    font-size: 13px;
  }

  @media (min-width: 768px) and (max-width: 991px) {
    font-size: 14px;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    font-size: 15px;
  }

  @media (min-width: 1200px) {
    font-size: 15px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  // 添加伪元素样式
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 14px; // 保持和图片相同的边框半径
    pointer-events: none; // 确保伪元素不会阻止对真实元素的鼠标事件
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.09); // 调整这里的颜色和大小以符合你的设计
    z-index: 1;
  }
  // 确保 Image 组件的 z-index 小于伪元素
  .ant-image {
    position: relative;
    z-index: 0;
  }
`;

const InputContent = styled.div`
  @media (max-width: 768px) {
    position: sticky;
    top: calc(10px + var(--safe-area-inset-top));
    z-index: 100;
  }
`;

const SearchAddon = styled.div<{ $isDark: boolean }>`
  transition: transform 0.2s ease; /* 添加缓动效果 */
  position: absolute;
  height: 40px;
  background-color: #570df8;
  border-radius: 20px;
  line-height: 40px;
  right: 4px;
  top: 4px;
  z-index: 100;
  font-size: 16px;
  color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.95)"};
  box-shadow: 0px 6px 10px 0px rgba(87, 13, 248, 0.2);
  &:hover {
    transform: scale(0.97); /* 悬停时缩放 */
  }
`;

const SearchAddonBefore = styled.div`
  position: absolute;
  height: 50px;
  width: 50px;
  left: 0;
  top: 0;
  z-index: 100;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default observer(Dashboard);
