import { Button, Flex, Form, Checkbox } from "antd";
import * as React from "react";
import styled from "styled-components";
import BasicInput from "/@/components/input";
import BasicInputNumber from "/@/components/inputNumber";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { subscribe } from "/@/api";
import BasicModal from "/@/components/modal";
import useStores from "/@/hooks/useStores";
interface Props {
  visible: boolean;
  cancel: () => void;
  success: () => void;
  editRow?: any;
}

interface ValuesType {
  album_id: string | undefined;
  book_title: string | undefined;
  author: string | undefined;
  reader: string | undefined;
  cover_url: string | undefined;
  ep_start: string | undefined;
  audio_start: string | undefined;
  audio_end: string | undefined;
  index_on: string | undefined;
  index_offset: string | undefined;
}

const AddSubscribeModal: React.FC<Props> = ({
  visible,
  cancel,
  success,
  editRow,
}) => {
  const [isChecked, setChecked] = React.useState<boolean>(
    editRow?.index_on || false
  );

  const onFinish = React.useCallback(
    async (values: ValuesType) => {
      try {
        await subscribe({
          ...values,
          index_offset: isChecked
            ? values?.index_offset
            : editRow?.index_offset,
        });
        success();
      } catch (error) {
        console.log(error);
      }
    },
    [isChecked]
  );

  const [form] = Form.useForm();

  // const initialValues = React.useMemo(() => {
  //   if (!editRow || !Object.keys(editRow)?.length) return;
  //   return editRow;
  // }, [editRow]);

  const initialValues = React.useMemo(() => {
    if (!editRow || Object.keys(editRow).length === 0) {
      return {
        ep_start: 1, // 提供默认值
        audio_start: 0,
        audio_end: 0,
        index_offset: 0,
      };
    }
    return {
      ...editRow, // 使用 editRow 的值
      ep_start: editRow.ep_start || 1, // 如果 editRow 中没有 ep_start，就使用 '1'
      audio_start: editRow.audio_start || 0,
      audio_end: editRow.audio_end || 0,
      index_offset: editRow.index_offset || 0,
      // ...其他字段也可以这样设置默认值
    };
  }, [editRow]);

  const onChange = React.useCallback((e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  }, []);
  const { auth } = useStores();
  return (
    <BasicModal
      visible={visible}
      cancel={cancel}
      width={600}

      // title={<Title>{!!editRow ? "编辑订阅" : "添加订阅"}</Title>}
      // title={<Title>{!!editRow ? "编辑订阅" : "添加订阅"}</Title>}
      // open={visible}
      // onCancel={cancel}
      // centered={true}
      // footer={null}
      // closable={false}
      // maskClosable={false}
      // destroyOnClose
    >
      <Title $isDark={auth.isDark}>{!!editRow ? "编辑订阅" : "添加订阅"}</Title>
      <Form
        initialValues={initialValues}
        className="mt-[30px]"
        onFinish={onFinish}
        form={form}
      >
        <Form.Item
          name="album_id"
          rules={[{ required: true, message: "请输入ID" }]}
        >
          <BasicInput placeholder="喜马拉雅专辑ID" />
        </Form.Item>
        {/* <Form.Item name="downloaded_path_base">
          <BasicInput placeholder="下载保存路径" />
        </Form.Item> */}
        <Flex justify="space-between" gap={"20px"}>
          <Form.Item name="book_title" className="flex-1">
            <BasicInput placeholder="书名" />
          </Form.Item>
          <Form.Item name="ep_start" className="flex-1">
            <BasicInput placeholder="订阅起始集" />
          </Form.Item>
        </Flex>
        <Flex justify="space-between" gap={"20px"}>
          <Form.Item name="author" className="flex-1">
            <BasicInput placeholder="原著作者" />
          </Form.Item>
          <Form.Item name="reader" className="flex-1">
            <BasicInput placeholder="演播者" />
          </Form.Item>
        </Flex>
        <Flex justify="space-between" gap={"20px"}>
          <Form.Item name="audio_start" className="flex-1">
            <BasicInputNumber controls={false} placeholder="剪辑片头（秒）" />
          </Form.Item>
          <Form.Item name="audio_end" className="flex-1">
            <BasicInputNumber controls={false} placeholder="剪辑片尾（秒）" />
          </Form.Item>
        </Flex>
        <Form.Item name="index_on" valuePropName="checked">
          <StyledCheckbox onChange={onChange}>偏移</StyledCheckbox>
        </Form.Item>
        {isChecked && (
          <Form.Item name="index_offset">
            <BasicInputNumber controls={false} placeholder="偏移量" />
          </Form.Item>
        )}

        <Form.Item className="mt-[20px]">
          <Flex justify="space-between" gap={"20px"}>
            <Button className="flex-1" onClick={cancel}>
              取消
            </Button>
            <Button
              className="shadow-none flex-1"
              type="primary"
              htmlType="submit"
            >
              确定
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </BasicModal>
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

const Title = styled.div<{ $isDark: boolean }>`
  font-size: 19px;
  font-weight: 600;
  text-align: center;
  color: ${(props) =>
    props.$isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.8)"};
`;

export default AddSubscribeModal;
