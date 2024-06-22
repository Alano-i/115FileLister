import dayjs from "dayjs";
import { FileInfo } from "/@/api";

// 定义文件类型与图标的对应关系
const fileIconMap: { [key: string]: string[] } = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg", "heic", "raw", "psd"],
  pdf: ["pdf"],
  word: ["doc", "docx"],
  excel: ["xls", "xlsx"],
  powerpoint: ["ppt", "pptx"],
  text: ["txt", "ass", "srt"],
  code: ["js", "ts", "json", "html", "css", "scss", "py", "less", "md", "xml"],
  audio: ["mp3", "flac", "wav", "aac", "ogg", "wma", "alac", "aiff", "dsd", "pcm", "m4a", "opus", "amr", "ape", "au", "ra", "mp2", "ac3", "dts"],
  video: ["mkv", "mp4", "avi","iso", "flv", "mov", "wmv", "webm", "mpeg", "mpg", "m4v", "3gp", "3g2", "ts", "vob", "ogv", "mxf", "rm", "rmvb", "asf", "f4v", "f4p", "f4a", "f4b"],
  configuration: ["ini", "yaml", "yml"],
  db: ["db"],
  nfo: ["nfo"],
  ebook: ["epub", "mobi", "azw3", "kfx", "azw"],
  archive: ["zip", "rar", "tar", "7z"],
};

// 定义图标路径
const iconPathMap: { [key: string]: string } = {
  image: "/img/image.svg",
  pdf: "/img/pdf.svg",
  word: "/img/word.svg",
  excel: "/img/excel.svg",
  powerpoint: "/img/ppt.svg",
  text: "/img/text.svg",
  audio: "/img/audio.svg",
  video: "/img/video.svg",
  archive: "/img/archive.svg",
  code: "/img/code.svg",
  db: "/img/db.svg",
  nfo: "/img/nfo.svg",
  ebook: "/img/ebook.svg",
  configuration: "/img/config.svg",
  default: "/img/default.svg", // 默认图标路径
};

/**
 * 根据文件后缀名返回文件类型
 * @param fileName - 文件名
 * @returns 文件类型
 */
function getFileType(fileName: string): string {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  for (const [iconType, extensions] of Object.entries(fileIconMap)) {
    if (extensions.includes(fileExtension)) {
      return iconType;
    }
  }

  return "default";
}

/**
 * 根据文件后缀名返回图标路径
 * @param fileType - 文件名
 * @returns 文件类型
 */
function getFileIcon(fileType: string): string {
  return iconPathMap[fileType];
}

const FileItem = ({
  file,
  onClick,
}: {
  file: FileInfo;
  onClick: () => void;
}) => {
  const fileType = getFileType(file.name);
  const fileIcon = getFileIcon(fileType);

  return (
    <tr
      className="group cursor-pointer hover:bg-[#FFFFFF0D] text-[14px] group-hover:text-[15px] text-[#FFFFFFCC] group-hover:text-[#ffffffee] transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      <td className="rounded-l-[8px]">
        <div className="flex items-center mb-[2px] px-0 hover:px-[14px] py-[16px] transition-all duration-300 ease-in-out">
          {file.is_directory ? (
            <img
              src="/img/folder.svg"
              className="mr-2 w-[32px] h-[32px]"
              alt="folder"
            />
          ) : (
            <img src={fileIcon} className="mr-2 w-[32px] h-[32px]" alt="file" />
          )}
          {/* <div className="line-clamp-1">{file.name}</div> */}
          <div>{file.name}</div>
        </div>
      </td>
      <td className="whitespace-nowrap text-center min-w-[150px]">
        <div className="p-2">{file.format_size || "-"}</div>
      </td>
      <td className="whitespace-nowrap text-center min-w-[200px]">
        <div className="p-2">
          {dayjs(file.mtime * 1000).format("YYYY-MM-DD HH:mm")}
        </div>
      </td>
      <td className="whitespace-nowrap overflow-hidden rounded-r-[8px] text-center">
        <div className="flex gap-2 p-2 justify-end items-center">
          {fileType === "video" && (
            <div className=" cursor-pointer ml-6 rounded-[6px] bg-[#FFFFFF0D] hover:bg-[#ffffff] transition-all duration-300 ease-in-out">
              <div className="text-[14px] leading-[14px] text-[#ffffffcc]  flex items-center px-[12px] py-[10px] hover:text-[#000000] transition-all duration-300 ease-in-out">
                <svg
                  className="w-[16px] h-[16px] mr-[4px]"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM7.1775 5.31822C6.84522 5.0967 6.40015 5.3349 6.40015 5.73425V10.2657C6.40015 10.6651 6.84522 10.9033 7.1775 10.6818L10.5761 8.41601C10.873 8.2181 10.873 7.78187 10.5761 7.58396L7.1775 5.31822Z"
                    fill="currentColor"
                    fill-opacity="1"
                  />
                </svg>
                播放
              </div>
            </div>
          )}
          <div className=" cursor-pointer rounded-[6px] bg-[#FFFFFF0D] hover:bg-[#ffffff] transition-all duration-300 ease-in-out">
            <div className="text-[14px] leading-[14px]  flex items-center px-[12px] py-[10px] hover:text-[#000000] transition-all duration-300 ease-in-out">
              <svg
                className="w-[16px] h-[16px]"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8Z"
                  fill="currentColor"
                  fill-opacity="0.8"
                />
                <path
                  d="M9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8Z"
                  fill="currentColor"
                  fill-opacity="0.8"
                />
                <path
                  d="M13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8Z"
                  fill="currentColor"
                  fill-opacity="1"
                />
              </svg>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default FileItem;
