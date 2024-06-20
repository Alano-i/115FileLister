import * as React from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import Layout from "/@/layout";
import { ConfigProvider, Result, Spin, message } from "antd";
import Home from "/@/views/dashboard";
import Login from "/@/views/login";
import { ReactNode, createContext } from "react";
import useStores from "/@/hooks/useStores";
import { Router } from "./router";
import zhCN from "antd/lib/locale/zh_CN";
import { MessageInstance } from "antd/es/message/interface";

interface RequireAuthProps {
  children?: ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { auth } = useStores();
  const location = useLocation();

  if (!auth.authenticated) {
    // 用户未登录，重定向至登录页，并附带当前位置信息
    return (
      <Navigate to="/login" state={{ redirect: location.pathname }} replace />
    );
  }

  const currentRoute = Router.find(({ path }) => path === location.pathname);

  if (!!currentRoute && currentRoute?.role === "admin" && !auth.isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
};

export const MessageContext = createContext<MessageInstance | null>(null);

const Config = () => {
  const { auth } = useStores();

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <ConfigProvider locale={zhCN} theme={auth.theme}>
      <MessageContext.Provider value={messageApi}>
        {contextHolder}
        <Outlet />
      </MessageContext.Provider>
    </ConfigProvider>
  );
};

const BasicRoutes = () => {
  return (
    <React.Suspense fallback={<Spin />}>
      <Routes>
        <Route element={<Config />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route element={<RequireAuth />}>
              <Route index element={<Home />} />
              {Router?.map(({ element, path }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          </Route>
          <Route
            path="/403"
            element={
              <Result
                status="403"
                title="403"
                subTitle="对不起，您没有权限访问这个页面"
              />
            }
          />
          <Route
            path="/500"
            element={
              <Result status="500" title="500" subTitle="服务器开小差啦！" />
            }
          />
          <Route
            path="*"
            element={
              <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
              />
            }
          />
        </Route>
      </Routes>
    </React.Suspense>
  );
};

export default BasicRoutes;
