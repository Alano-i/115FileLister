import { Ancestor, FileInfo, getList } from "/@/api";
import { useSearchParams } from "react-router-dom";
import FileItem from "./components/FileItem";
import useSWR from "swr";
import { Fragment, useEffect, useState } from "react";
import { message } from "antd";

const Index = () => {
  let [searchParams, setSearchParams] = useSearchParams();

  const path = searchParams.get("path") || "/";

  const {
    data: fileList,
    error: fileListError,
    isLoading: isFileListLoading,
  } = useSWR<FileInfo[]>(["/list", path], ([_url, path]: any) =>
    getList({ path })
  );

  const [ancestors, setAncestors] = useState<Ancestor[]>([]);

  useEffect(() => {
    if (fileList) {
      setAncestors(fileList[0]?.ancestors.slice(0, -1) || []);
    }
  }, [fileList]);

  const navTo = (file: Pick<FileInfo, "path" | "ancestors">) => {
    setSearchParams({ path: file.path });
    setAncestors(file.ancestors);
  };

  const renderFileList = () => {
    if (isFileListLoading) {
      return <div>加载中...</div>;
    }

    if (fileListError) {
      return <div>错误: {fileListError.message}</div>;
    }

    return (
      <table className="table-auto w-full" rules="none">
        <thead>
          <tr className="text-[13px]   text-[#ffffff4f]">
            <th className="text-left py-[4px] w-full">名称</th>
            <th className="text-center py-[4px] whitespace-nowrap">大小</th>
            <th className="text-center  py-[4px]">修改日期</th>
            <th className="text-right  py-[4px] pr-[14px]">操作</th>
          </tr>
        </thead>
        <tbody>
          {fileList?.map((file) => {
            return (
              <FileItem
                key={file.id}
                file={file}
                onClick={() => {
                  if (file.is_directory) {
                    navTo(file);
                  }
                }}
              />
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {/* 面包屑 */}
      <div className="flex items-center mb-[12px] text-[#FFFFFFaa] text-[14px]">
        <img
          src="/img/home.svg"
          className="mr-[6px] w-[16px] h-[16px] opacity-25"
          alt="back"
        />
        <span
          className="pr-[4px] hover:text-[#ffffffee] cursor-pointer  transition-all duration-300 ease-in-out whitespace-nowrap"
          onClick={() => {
            navTo({ path: "/", ancestors: [] });
          }}
        >
          首页
        </span>
        <div>
          {ancestors.map((item, index) => {
            return (
              <Fragment key={item.id}>
                <span
                  className="hover:text-[#ffffffee] cursor-pointer  transition-all duration-300 ease-in-out"
                  onClick={() => {
                    const newAncestors = ancestors.slice(0, index + 1);
                    navTo({
                      path: newAncestors.map((item) => item.name).join("/"),
                      ancestors: newAncestors,
                    });
                  }}
                >
                  {item.name}
                </span>
                {index !== ancestors.length - 1 && " / "}
              </Fragment>
            );
          })}
        </div>
        <div className="group flex items-center justify-center rounded-[4px] ml-[12px] hover:bg-[#ffffff] transition-all duration-300 ease-in-out">
          <img
            src="/img/copy.svg"
            className="cursor-pointer w-[28px] h-[28px] opacity-100 transition-all duration-300 ease-in-out group-hover:filter group-hover:brightness-0"
            alt="复制路径"
            onClick={() => {
              navigator.clipboard.writeText(path).then(
                () => {
                  message.success("已复制路径");
                },
                () => {
                  message.error("复制路径失败，请手动复制");
                }
              );
            }}
          />
        </div>
      </div>

      {/* 返回上级目录 */}
      {path !== "/" && (
        <div
          className="mb-[0px] text-[14px] text-[#FFFFFFCC] hover:text-[15px] hover:text-[#ffffffee] hover:px-[14px] py-[12px] rounded-[8px] cursor-pointer hover:bg-[#ffffff0d] transition-all duration-300 ease-in-out"
          onClick={async () => {
            const parentPath = ancestors
              .slice(0, -1)
              .map((item) => item.name)
              .join("/");
            setSearchParams({ path: parentPath });
          }}
        >
          <div className="flex items-center">
            <img
              src="/img/back.svg"
              className="mr-[6px] w-[9px] opacity-25"
              alt="back"
            />
            返回上级目录
          </div>
        </div>
      )}

      {/* 文件列表 */}
      {renderFileList()}
    </div>
  );
};

export default Index;
