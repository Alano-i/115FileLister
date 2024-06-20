import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Routes from "/@/routes";
import "./assets/fonts/iconfont/iconfont";
import "./index.css";

const element = document.getElementById("root");

if (element) {
  const App = () => (
    //严格模式会在开发环境令组件渲染两次（非开发环境不受影响）
    <React.StrictMode>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </React.StrictMode>
  );
  const root = createRoot(element);
  root.render(<App />);
}
