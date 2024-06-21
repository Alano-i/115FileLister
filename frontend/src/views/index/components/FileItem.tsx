import dayjs from "dayjs";
import { FileInfo } from "/@/api";

// 定义文件类型与图标的对应关系
const fileIconMap: { [key: string]: string[] } = {
  image: ["jpg", "jpeg", "png", "gif"],
  pdf: ["pdf"],
  word: ["doc", "docx"],
  excel: ["xls", "xlsx"],
  powerpoint: ["ppt", "pptx"],
  text: ["txt", "ass", "srt"],
  code: ["js", "ts", "json", "html", "css", "scss", "py", "less", "md", "xml"],
  audio: ["mp3", "flac", "wav"],
  video: ["mkv", "mp4", "avi"],
  configuration: ["ini", "yaml", "yml"],
  db: ["db"],
  nfo: ["nfo"],
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
      className="group cursor-pointer hover:bg-[#FFFFFF0D] transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      <td className="rounded-l-[8px]">
        <div className="flex items-center mb-[2px] px-0 group-hover:px-[14px] py-[16px] text-[14px] group-hover:text-[15px] text-[#FFFFFFCC] group-hover:text-[#ffffffee] transition-all duration-300 ease-in-out">
          {file.is_directory ? (
            <img
              src="/img/folder.svg"
              className="mr-2 w-[32px] h-[32px]"
              alt="folder"
            />
          ) : (
            <img src={fileIcon} className="mr-2 w-[32px] h-[32px]" alt="file" />
          )}
          <div className="line-clamp-1">{file.name}</div>
        </div>
      </td>
      <td className="whitespace-nowrap text-center">
        <div className="p-2">{file.format_size || "-"}</div>
      </td>
      <td className="whitespace-nowrap text-center">
        <div className="p-2">
          {dayjs(file.mtime * 1000).format("YYYY-MM-DD HH:mm")}
        </div>
      </td>
      <td className="whitespace-nowrap overflow-hidden rounded-r-[8px] text-center">
        <div className="flex gap-2 p-2 justify-end items-center">
          {fileType === "video" && (
            <div className="ml-6 leading-none flex items-center px-4 rounded bg-[#FFFFFF0D] h-8">
              <img
                src="/img/play.svg"
                alt="play"
                className="text-white w-4 h-4 mr-1"
              />
              播放
            </div>
          )}
          <div className="rounded bg-[#FFFFFF0D] h-8 w-8">...</div>
        </div>
      </td>
    </tr>
  );
};

export default FileItem;
