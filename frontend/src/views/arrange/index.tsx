import {
  Flex,
  Form,
  Radio,
  SelectProps,
  RadioChangeEvent,
  Checkbox,
  Button,
  Switch,
} from "antd";
import * as React from "react";
import styled from "styled-components";
import BasicInput from "/@/components/input";
import BasicSelect from "/@/components/select";
import BasicInputNumber from "/@/components/inputNumber";
import { useMessage } from "/@/hooks/useMessage";
import useStores from "/@/hooks/useStores";
import { useIsMobile } from "/@/hooks/useIsMobile";

const Arrange: React.FC = () => {
  const [form] = Form.useForm();
  const { auth } = useStores();
  const isMobile = useIsMobile();
  const { success } = useMessage();

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("数据:", values);
      await auth.makePodcast(values);
      success("更新成功");
    } catch (error) {
      console.log(error);
    } finally {
      // setLoading(false);
    }
  };

  const options: SelectProps["options"] = [
    { label: "剪辑", value: "剪辑" },
    { label: "整理", value: "整理" },
    { label: "添加元数据", value: "添加元数据" },
  ];

  const mainOptions: SelectProps["options"] = [
    { value: "podcast_m", label: "🎧 生成播客源" },
    { value: "audio_clip_m", label: "🎹 剪辑音频" },
    { value: "add_cover_m", label: "🖼 修改封面" },
    { value: "xmly_download", label: "⬇️ 下载喜马拉雅" },
  ];

  // 状态变量，跟踪当前选择的操作
  const [selectedOperation, setSelectedOperation] = React.useState("podcast_m");
  const [isBook, setIsbook] = React.useState("audio_book");

  // 当选择操作改变时的处理函数
  const handleOperationChange = (value: any) => {
    setSelectedOperation(value);
  };

  const handleIsbookChange = (e: RadioChangeEvent) => {
    setIsbook(e.target.value);
  };

  return (
    <Content>
      <Form
        className="mt-[30px] max-w-[800px] mx-auto flex flex-col items-center"
        onFinish={onFinish}
        initialValues={{
          operate: selectedOperation,
          is_book_config: isBook,
          is_group: true,
          short_filename: true,
          deep: false,
        }}
      >
        <Form.Item className="w-full" name="operate">
          <BasicSelect
            options={mainOptions}
            placeholder="选择操作"
            onChange={handleOperationChange}
          />
        </Form.Item>

        {/* 使用 switch 语句根据 operate 来展示不同的设置项 */}
        <div className="w-full">
          {(() => {
            switch (selectedOperation) {
              case "podcast_m":
                return (
                  <div>
                    <Form.Item name="is_book_config">
                      <Radio.Group
                        onChange={handleIsbookChange}
                        className="flex  gap-[24px]"
                      >
                        <Radio value={"audio_book"}>有声书</Radio>
                        <Radio value={"music"}>音乐</Radio>
                        <Radio value={"auto_all"}>存量有声书</Radio>
                      </Radio.Group>
                    </Form.Item>
                    {/* 使用 switch 语句根据 isBook 来展示不同的设置项 */}
                    <div className="w-full">
                      {(() => {
                        switch (isBook) {
                          case "audio_book":
                            return (
                              <div>
                                <Form.Item name="input_dirs">
                                  <BasicInput placeholder="输入路径" />
                                </Form.Item>

                                <Form.Item className="flex-1" name="book_title">
                                  <BasicInput placeholder="书名" />
                                </Form.Item>

                                <div
                                  className={`w-full ${
                                    isMobile ? "flex flex-col" : "flex flex-row"
                                  } ${isMobile ? "" : "gap-[20px]"}`}
                                >
                                  <Form.Item className="w-full" name="">
                                    <BasicInput placeholder="原著作者" />
                                  </Form.Item>
                                  <Form.Item className="w-full" name="reader">
                                    <BasicInput placeholder="演播者" />
                                  </Form.Item>
                                </div>
                                <div
                                  className={`w-full ${
                                    isMobile ? "flex flex-col" : "flex flex-row"
                                  } ${isMobile ? "" : "gap-[20px]"}`}
                                >
                                  <Form.Item
                                    className="w-full"
                                    name="art_album"
                                  >
                                    <BasicInput placeholder="专辑艺术家（推荐填写书名）" />
                                  </Form.Item>
                                  <Form.Item className="w-full" name="subject">
                                    <BasicInput placeholder="题材" />
                                  </Form.Item>
                                </div>

                                <Flex
                                  justify="space-between"
                                  gap={"20px"}
                                  className="w-full"
                                >
                                  <Form.Item className="w-full" name="year">
                                    <BasicInput placeholder="发布年份" />
                                  </Form.Item>
                                </Flex>
                                <Form.Item
                                  className="w-full"
                                  name="podcast_summary"
                                >
                                  <BasicInput placeholder="简介" />
                                </Form.Item>
                                {isMobile ? (
                                  <div>
                                    <Flex
                                      justify="space-between"
                                      gap={"20px"}
                                      className="w-full"
                                    >
                                      <span>第一季强制200集</span>
                                      <Form.Item
                                        name="is_group"
                                        valuePropName="checked"
                                      >
                                        <Switch />
                                      </Form.Item>
                                    </Flex>
                                    <Flex
                                      justify="space-between"
                                      gap={"20px"}
                                      className="w-full"
                                    >
                                      <span>根据文件名优化每集标题</span>
                                      <Form.Item
                                        name="short_filename"
                                        valuePropName="checked"
                                      >
                                        <Switch />
                                      </Form.Item>
                                    </Flex>
                                    <Flex
                                      justify="space-between"
                                      gap={"20px"}
                                      className="w-full"
                                    >
                                      <span>深路径</span>
                                      <Form.Item
                                        name="deep"
                                        valuePropName="checked"
                                      >
                                        <Switch />
                                      </Form.Item>
                                    </Flex>
                                  </div>
                                ) : (
                                  <Flex gap={"32px"}>
                                    <Form.Item
                                      name="is_group"
                                      valuePropName="checked"
                                    >
                                      <StyledCheckbox>
                                        第一季强制200集
                                      </StyledCheckbox>
                                    </Form.Item>
                                    <Form.Item
                                      name="short_filename"
                                      valuePropName="checked"
                                    >
                                      <StyledCheckbox>
                                        根据文件名优化每集标题
                                      </StyledCheckbox>
                                    </Form.Item>
                                    <Form.Item
                                      name="deep"
                                      valuePropName="checked"
                                    >
                                      <StyledCheckbox>深路径</StyledCheckbox>
                                    </Form.Item>
                                  </Flex>
                                )}
                              </div>
                            );

                          default:
                            return null;
                        }
                      })()}
                    </div>
                  </div>
                );
              case "audio_clip_m":
                return (
                  <div>
                    <Form.Item name="output_dir">
                      <BasicInput placeholder="输出路径，默认：输入路径" />
                    </Form.Item>
                    <Form.Item name="cliped_folder">
                      <BasicInput placeholder="剪辑后存放路径，默认：书名 - 作者 - 演播者" />
                    </Form.Item>
                    <Flex justify="space-between" gap={"20px"}>
                      <Form.Item className="flex-1" name="audio_start">
                        <BasicInputNumber
                          controls={false}
                          placeholder="剪辑片头，单位：秒"
                        />
                      </Form.Item>
                      <Form.Item className="flex-1" name="audio_end">
                        <BasicInputNumber
                          controls={false}
                          placeholder="剪辑片尾，单位：秒"
                        />
                      </Form.Item>
                    </Flex>
                    <Form.Item className="flex-1" name="action">
                      <BasicSelect options={options} placeholder="选择操作" />
                    </Form.Item>
                    <Form.Item className="w-full" name="albums">
                      <BasicInput placeholder="专辑，留空则自动按每100集划分" />
                    </Form.Item>
                  </div>
                );
              case "add_cover_m":
                return (
                  <div>
                    <Form.Item name="tg_base_url">
                      <BasicInput placeholder="Telgram 服务器地址" />
                    </Form.Item>
                  </div>
                );
              case "xmly_download":
                return (
                  <div>
                    <Form.Item name="tg_base_url">
                      <BasicInput placeholder="Telgram 服务器地址" />
                    </Form.Item>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </div>

        <Form.Item className="w-full">
          <Button
            onClick={onFinish}
            className="w-full shadow-none mb-[8px] text-[17px] font-bold"
            type="primary"
          >
            运行
          </Button>
        </Form.Item>

        {/* <Form.Item className="w-full" name="id">
          <Radio.Group>
            <Radio value={"1"}>音频剪辑</Radio>
            <Radio value={"2"}>DIY元数据</Radio>
            <Radio value={"3"}>整理文件夹 + DIY元数据</Radio>
          </Radio.Group>
        </Form.Item> */}
      </Form>
    </Content>
  );
};

const Content = styled.div`
  margin: auto;
`;

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

export default Arrange;
