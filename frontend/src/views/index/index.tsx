import { useEffect, useState } from "react";
import { FileInfo, getList, getAncestors, Ancestor } from "/@/api";
import { useSearchParams } from "react-router-dom";

// 定义文件类型与图标的对应关系
const fileIconMap: { [key: string]: string[] } = {
  image: ["jpg", "jpeg", "png", "gif"],
  // pdf: ["pdf"],
  // word: ["doc", "docx"],
  // excel: ["xls", "xlsx"],
  // powerpoint: ["ppt", "pptx"],
  text: ["txt", "nfo", "srt", "yaml", "yml"],
  code: ["js", "ts", "json", "html", "css", "scss", "py", "less", "md", "xml", "yaml", "yml"],
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
  code: "/img/code.svg",
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
      className="flex items-center mb-[2px]  px-0 hover:px-[14px] py-[16px] rounded-[8px] cursor-pointer text-[14px]  hover:text-[15px] text-[#FFFFFFCC] hover:text-[#ffffffee] hover:bg-[#FFFFFF0D] transition-all duration-300"
      onClick={onClick}
    >
      {file.is_directory ? (
        <img
          src="/img/folder.svg"
          className="mr-2 w-[32px] h-[32px]"
          alt="folder"
        />
      ) : (
        <img
          src={getFileIcon(file.name)}
          className="mr-2 w-[32px] h-[32px]"
          alt="file"
        />
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
      <div className="flex items-center mb-[12px] text-[#FFFFFFaa] text-[14px]">
        <img
          src="/img/home.svg"
          className="mr-[6px] w-[16px] h-[16px] opacity-25"
          alt="back"
        />
        <span className="pr-[4px] hover:text-[#ffffffee] cursor-pointer  transition-all duration-300">
          首页
        </span>
        <div>
          {ancestors.map((item, index) => {
            return (
              <>
                <span
                  key={item.id}
                  className="hover:text-[#ffffffee] cursor-pointer  transition-all duration-300"
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
      </div>

      {/* 返回上级目录 */}
      {path !== "/" && (
        <div
          className="mb-[0px] text-[14px] text-[#FFFFFFCC] hover:text-[15px] hover:text-[#ffffffee] hover:px-[14px] py-[12px] rounded-[8px] cursor-pointer hover:bg-[#ffffff0d] transition-all duration-300"
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
              src="/img/back.svg" className="mr-[6px] w-[9px] opacity-25" alt="back"
            />
            返回上级目录
          </div>
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
