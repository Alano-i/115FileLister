import React from "react";
import Logs from "/@/views/logs";
import Arrange from "/@/views/arrange";
import Subscribe from "/@/views/subscribe";
import Settings from "/@/views/settings";

//角色
type Role = "admin" | "user";

interface T {
  path: string;
  element: React.ReactNode;
  role?: Role | undefined;
  children?: Array<T>;
}

export const Router: Array<T> = [
  {
    path: "/logs",
    element: <Logs />,
    role: "admin",
  },
  {
    path: "/arrange",
    element: <Arrange />,
    role: "admin",
  },
  {
    path: "/subscribe",
    element: <Subscribe />,
    role: "admin",
  },
  {
    path: "/settings",
    element: <Settings />,
    role: "admin",
  },
];
