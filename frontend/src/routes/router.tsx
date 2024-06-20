import React from "react";
import Index from "/@/views/index";

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
    path: "/",
    element: <Index />,
  },
];
