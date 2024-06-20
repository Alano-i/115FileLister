import {
  Button,
  Checkbox,
  Flex,
  Form,
  Radio,
  RadioChangeEvent,
  Spin,
  Switch,
} from "antd";
import * as React from "react";
import { useState } from "react";
import BasicInput from "/@/components/input";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import { useLocation, useNavigate } from "react-router-dom";
import { useMessage } from "/@/hooks/useMessage";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import styled from "styled-components";
import { useIsMobile } from "/@/hooks/useIsMobile";

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [notifyType, setNotifyType] = useState("qywx");
  const [isChecked, setChecked] = useState<boolean>(false);
  const [isNotifyChecked, setNotifyChecked] = useState<boolean>(false);
  const { auth } = useStores();
  const isMobile = useIsMobile();
  const native = useNavigate();
  const location = useLocation();
  const { success } = useMessage();

  const handleNotifyTypeChange = (e: RadioChangeEvent) => {
    setNotifyType(e.target.value);
  };

  const onFinish = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await auth.updateConfig(values);
      success("更新成功");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!!auth?.config) {
      form.setFieldsValue(auth.config);
      setNotifyType((auth.config as any)?.channel);
      setChecked(!!(auth.config as any)?.update_podcast_switch);
      setNotifyChecked(!!(auth.config as any)?.notify_switch);
    }
  }, [auth.config]);

  const handleLogout = async () => {
    try {
      await auth.authLogout();
      success("退出成功");
      native("/login", {
        state: {
          redirect: location?.pathname,
        },
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = React.useCallback((e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  }, []);

  const onSwitchChange = React.useCallback((checked: boolean) => {
    setChecked(checked);
  }, []);

  const onNotifyChange = React.useCallback((e: CheckboxChangeEvent) => {
    setNotifyChecked(e.target.checked);
  }, []);
  const onNotifySwitchChange = React.useCallback((checked: boolean) => {
    setNotifyChecked(checked);
  }, []);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        className={`mt-[30px] max-w-[800px] ${
          isMobile ? "w-full" : "min-w-[780px]"
        } mx-auto flex flex-col items-left`}
        initialValues={{
          theme: "dark",
          channel: "qywx",
          update_podcast_switch: false,
          notify_switch: false,
          cron_expression: "5 8-23 * * *",
        }}
      >
        <div className="w-full pb-[18px] text-[19px] font-bold">基础设置</div>
        {/* <div className="w-full pb-[24px] text-[13px] opacity-75">
          以下三个路径不支持修改，你需要将外部路径映射到对应文件夹。
        </div> */}
        <div
          className={`w-full ${isMobile ? "flex flex-col" : "flex flex-row"} ${
            isMobile ? "" : "gap-[20px]"
          }`}
        >
          {/* <Form.Item rules={[{ required: true }]} className="w-full" name="src_base_path">
            <BasicInput placeholder="播客文件夹" disabled={true} />
          </Form.Item> */}

          <Form.Item className="w-full" name="src_base_path_book">
            <BasicInput placeholder="有声书根文件夹" />
          </Form.Item>
          <Form.Item className="w-full" name="src_base_path_music">
            <BasicInput placeholder="音乐根文件夹" />
          </Form.Item>
          <Form.Item className="w-full" name="downloads_path">
            <BasicInput placeholder="下载保存文件夹" />
          </Form.Item>
        </div>

        <Form.Item className="w-full" name="server_url">
          <BasicInput placeholder="服务器地址(域名地址)" />
        </Form.Item>
        <Form.Item className="w-full" name="magic">
          <BasicInput placeholder="测试设置" />
        </Form.Item>
        <Form.Item className="w-full" name="mbot_download_api">
          <BasicInput placeholder="Mbot 下载完成 API 接口" />
        </Form.Item>
        {isMobile ? (
          <Flex justify="space-between" className="w-full">
            <span>定时更新播客源</span>
            <Form.Item name="update_podcast_switch" valuePropName="checked">
              <Switch onChange={onSwitchChange} />
            </Form.Item>
          </Flex>
        ) : (
          <Form.Item name="update_podcast_switch" valuePropName="checked">
            <StyledCheckbox onChange={onChange}>定时更新播客源</StyledCheckbox>
          </Form.Item>
        )}

        {isChecked && (
          <Form.Item className="w-full" name="cron_expression">
            <BasicInput placeholder="定时任务 cron 表达式" />
          </Form.Item>
        )}

        <div className="w-full py-[14px] text-[19px] font-bold">消息推送</div>

        {isMobile ? (
          <Flex justify="space-between" className="w-full">
            <span>启用通知</span>
            <Form.Item name="notify_switch" valuePropName="checked">
              <Switch onChange={onNotifySwitchChange} />
            </Form.Item>
          </Flex>
        ) : (
          <Form.Item name="notify_switch" valuePropName="checked">
            <StyledCheckbox onChange={onNotifyChange}>启用通知</StyledCheckbox>
          </Form.Item>
        )}
        {isNotifyChecked && (
          <div>
            <Form.Item className="w-full" name="channel">
              <Radio.Group onChange={handleNotifyTypeChange}>
                <Radio className="mr-[32px]" value={"qywx"}>
                  企业微信
                </Radio>
                <Radio className="mr-[32px]" value={"bark"}>
                  Bark
                </Radio>
                <Radio value={"telegram"}>Telgram</Radio>
              </Radio.Group>
            </Form.Item>

            <div className="w-full">
              {(() => {
                switch (notifyType) {
                  case "qywx":
                    return (
                      <div>
                        <Form.Item name="qywx_base_url">
                          <BasicInput placeholder="企业微信 API 地址" />
                        </Form.Item>
                        <Form.Item name="corpid">
                          <BasicInput placeholder="corpid" />
                        </Form.Item>
                        <Form.Item name="corpsecret">
                          <BasicInput placeholder="corpsecret" />
                        </Form.Item>
                        <Form.Item name="agentid">
                          <BasicInput placeholder="agentid" />
                        </Form.Item>
                        <Form.Item name="touser">
                          <BasicInput placeholder="touser" />
                        </Form.Item>
                      </div>
                    );
                  case "bark":
                    return (
                      <div>
                        <Form.Item name="bark_url">
                          <BasicInput placeholder="Bark服务器地址" />
                        </Form.Item>
                        <Form.Item name="bark_sound">
                          <BasicInput placeholder="声音" />
                        </Form.Item>
                        <Form.Item name="bark_group">
                          <BasicInput placeholder="分组" />
                        </Form.Item>
                        <Form.Item name="bark_icon">
                          <BasicInput placeholder="图标" />
                        </Form.Item>
                      </div>
                    );
                  case "telegram":
                    return (
                      <div>
                        <Form.Item name="tg_base_url">
                          <BasicInput placeholder="Telgram 服务器地址" />
                        </Form.Item>
                        <Form.Item name="tgbot_token">
                          <BasicInput placeholder="机器人 Token" />
                        </Form.Item>
                        <Form.Item name="tg_chat_id">
                          <BasicInput placeholder="聊天 ID" />
                        </Form.Item>
                        <Form.Item name="proxy">
                          <BasicInput placeholder="代理" />
                        </Form.Item>
                      </div>
                    );
                  default:
                    return null;
                }
              })()}
            </div>

            <Form.Item className="w-full" name="pic_url">
              <BasicInput placeholder="推送信息默认封面" />
            </Form.Item>
          </div>
        )}
        <div className="w-full pt-[16px] pb-[18px] text-[19px] font-bold">
          {" "}
          WEB 登录设置
        </div>
        <Form.Item className="w-full" name="username">
          <BasicInput placeholder="用户名" />
        </Form.Item>
        <Form.Item className="w-full" name="password">
          <BasicInput placeholder="密码" />
        </Form.Item>

        <div className="w-full py-[14px] text-[19px] font-bold">主题</div>
        <Form.Item className="w-full" name="theme">
          <Radio.Group>
            <Radio className="mr-[32px]" value={"dark"}>
              暗黑模式
            </Radio>
            <Radio value={"light"}>浅色模式</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item className="w-full">
          <Button
            onClick={onFinish}
            className="w-full shadow-none mb-[8px] text-[17px] font-bold"
            type="primary"
          >
            保存配置
          </Button>
          <Button
            onClick={handleLogout}
            className="w-full shadow-none mt-[8px] text-[17px]"
            type="text"
          >
            退出登录
          </Button>
        </Form.Item>
      </Form>
      <div></div>
    </Spin>
  );
};

const StyledCheckbox = styled(Checkbox)`
  .ant-checkbox-inner {
    width: 20px; /* 或其他你想要的大小 */
    height: 20px; /* 或其他你想要的大小 */
  }
  .ant-checkbox-inner::after {
    left: 5px; /* 调整对号的左边距 */
    top: 9px; /* 调整对号的顶部边距 */
    width: 7px; /* 调整对号的宽度 */
    height: 12px; /* 调整对号的高度 */
    // 可能还需要调整 transform 属性来确保对号居中
  }
`;

export default observer(Settings);
