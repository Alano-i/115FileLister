// 定义一个hook来检测是否为移动设备
import { useState } from "react";

// 定义移动设备的正则表达式，用来检测用户代理字符串
const mobileDeviceRegex =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

// 使用React Hook来创建这个功能
export const useIsMobile = (): boolean => {
  const [isMobile] = useState(() => {
    const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
    return mobileDeviceRegex.test(userAgent);
  });

  return isMobile;
};
