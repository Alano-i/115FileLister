import { useEffect, useState } from "react";
import { FileInfo, getList, getAncestors, Ancestor } from "/@/api";
import { useSearchParams } from "react-router-dom";

// 定义文件类型与图标的对应关系
const fileIconMap: { [key: string]: string[] } = {
  // image: ["jpg", "jpeg", "png", "gif"],
  // pdf: ["pdf"],
  // word: ["doc", "docx"],
  // excel: ["xls", "xlsx"],
  // powerpoint: ["ppt", "pptx"],
  text: ["txt"],
  // audio: ["mp3", "wav"],
  video: ["mkv", "mp4", "avi"],
  // archive: ["zip", "rar", "7z"]
};

// 定义图标路径
const iconPathMap: { [key: string]: string } = {
  image: "/img/image.svg",
  pdf: "/img/pdf.svg",
  word: "/img/word.svg",
  excel: "/img/excel.svg",
  powerpoint: "/img/powerpoint.svg",
  text: "/img/text.svg",
  audio: "/img/audio.svg",
  video: "/img/video.svg",
  archive: "/img/archive.svg",
  default: "/img/none.svg", // 默认图标路径
};

/**
 * 根据文件后缀名返回图标路径
 * @param fileName - 文件名
 * @returns 图标路径
 */
function getFileIcon(fileName: string): string {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  for (const [iconType, extensions] of Object.entries(fileIconMap)) {
    if (extensions.includes(fileExtension)) {
      return iconPathMap[iconType];
    }
  }

  return iconPathMap["default"];
}

const FileItem = ({
  file,
  onClick,
}: {
  file: FileInfo;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex item-center p-2 cursor-pointer hover:bg-gray-700"
      onClick={onClick}
    >
      {file.is_directory ? (
        <img src="/img/folder.svg" className="mr-2 w-6 h-6" alt="folder" />
      ) : (
        <img src={getFileIcon(file.name)} className="mr-2 w-6 h-6" alt="file" />
      )}
      {file.name}
    </div>
  );
};

const Index = () => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  let [searchParams, setSearchParams] = useSearchParams();
  let [ancestors, setAncestors] = useState<Ancestor[]>([]);

  const path = searchParams.get("path") || "/";

  const getFileList = async () => {
    const res = await getList({ path: path });
    setFileList(res);
  };

  const _getAncestors = async () => {
    const res = await getAncestors({ path: path });
    setAncestors(res);
  };

  useEffect(() => {
    _getAncestors();
    getFileList();
  }, [path]);

  return (
    <div>
      {/* 面包屑 */}
      <div className="mb-4">
        {ancestors.map((item, index) => {
          return (
            <>
              <span
                key={item.id}
                className="cursor-pointer hover:underline"
                onClick={() => {
                  const parentPath = ancestors
                    .slice(0, index + 1)
                    .map((item) => item.name)
                    .join("/");
                  setSearchParams({ path: parentPath });
                }}
              >
                {item.name}
              </span>
              {index !== ancestors.length - 1 && " / "}
            </>
          );
        })}
      </div>

      {/* 返回上级目录 */}
      {path !== "/" && (
        <div
          className="mb-4 cursor-pointer hover:underline"
          onClick={async () => {
            const parentPath = ancestors
              .slice(0, -1)
              .map((item) => item.name)
              .join("/");
            setSearchParams({ path: parentPath });
          }}
        >
          返回上级目录
        </div>
      )}

      {/* 文件列表 */}
      {fileList.map((file) => {
        return (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => {
              if (file.is_directory) {
                setSearchParams({ path: file.path });
                return;
              }
              alert("假装下载文件：" + file.name);
            }}
          />
        );
      })}
    </div>
  );
};

export default Index;
