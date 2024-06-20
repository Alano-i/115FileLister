import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Spin } from "antd";
import * as React from "react";
import { useLocation, Navigate } from "react-router-dom";
import styled from "styled-components";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import { useIsMobile } from "/@/hooks/useIsMobile";
import { useMessage } from "/@/hooks/useMessage";

export interface FormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const location = useLocation();

  const { auth } = useStores();

  const isMobile = useIsMobile();

  const [loading, setLoading] = React.useState<boolean>(false);

  const { success } = useMessage();

  const onFinish = React.useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true);
        await auth?.authLogin(values);
        success("登录成功");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  if (auth.authenticated) {
    return <Navigate to={location?.state?.redirect ?? "/"} replace />;
  }

  return (
    <Spin spinning={loading}>
      <Content>
        <div
          className={`flex rounded-[10px] overflow-hidden ${
            isMobile ? "h-full w-full" : "h-auto"
          }`}
        >
          <LoginContent className="flex flex-col gap-[4px] justify-center text-center">
            <div className="text-[22px]">登录</div>
            <div className="subTitle text-[14px] pb-[16px]">
              登录以使用完整功能
            </div>
            <Form
              className="text-left"
              onFinish={onFinish}
              initialValues={{
                username: "admin",
                password: "admin",
              }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  className="login-input"
                  placeholder="用户名"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input
                  prefix={<LockOutlined />}
                  type="password"
                  className="login-input"
                  placeholder="密码"
                />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" className="w-full login-btn">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </LoginContent>
          {!isMobile && (
            <TextContent className="flex-1">
              <div className="text-content">
                Very good <br />
                works are
                <br /> waiting for
                <br /> you Login
                <br /> Now!!!
              </div>
            </TextContent>
          )}
        </div>
      </Content>
    </Spin>
  );
};

const Content = styled.div`
  width: 100%;
  height: 100vh;
  background: #171717;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  .subTitle {
    color: rgba(255, 255, 255, 0.3);
  }
  @media (max-width: 768px) {
  }
`;

const LoginContent = styled.div`
  background: #232324;
  padding: 0 80px;
  .ant-input-status-error:not(.ant-input-disabled) {
    background: #ff000000;
    color: #ffffff;
    border-width: 1px;
    border-style: solid;
    border-color: #ff4d4f;

    &:focus-within,
    &:hover,
    &:focus {
      border-color: #ff4d4f;
      background: #ff000000;
      border: 1px solid ff4d4f;
      box-shadow: none;
    }

  }
  .login-input {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0);
    color: #ffffffcc;
    transition: all 0.3s ease;
    &:hover,
    &:focus-within,
    &:focus {
      
      border: 1px solid rgba(255, 255, 255, 0.4); // 增加透明度以提高对比度
      box-shadow: none; // 取消 box-shadow，如果有的话
    }
    
    .ant-input-prefix,
   
  }
  input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  .ant-input-status-error input::placeholder{
    color: rgba(0,0,0,.2);
  }
  .login-btn {
    color: #fff;
    border-radius: 50px;
    font-weight: bold;
    border: none;
    background: linear-gradient(100deg, #6329DE -5.85%, #570DF8 100%);
    box-shadow: 0px 8px 26px 0px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    &:hover {
      
      color: #fff !important;
      transform: scale(0.97); /* 悬停时缩放 */
      background: linear-gradient(100deg, #6329DE -5.85%, #570DF8 109.55%) !important;
    }
  }
  @media (max-width: 768px) {
    padding: 0 20px;
    width: 100%
  }
`;

const TextContent = styled.div`
  background: url("./logback.png");
  background-size: cover;
  background-position: center;
  padding: 86px 94px;
  .text-content {
    border-radius: 32.703px;
    border: 1px solid rgba(255, 255, 255, 0.52);
    background: rgba(255, 255, 255, 0.21);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    padding: 36px 99px 136px 63px;
    font-size: 22.75px;
    ont-style: normal;
    font-weight: 700;
    line-height: 32.703px;
  }
`;

export default observer(Login);
