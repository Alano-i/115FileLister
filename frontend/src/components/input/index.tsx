import { Input } from "antd";
import * as React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";

interface Props {
  placeholder?: string | null;
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
}
const BasicInput: React.FC<Props> = ({ placeholder = "", value, onChange, disabled }) => {
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string | undefined>("");
  const { auth } = useStores();

  const onFocus = () => setIsFocused(true);

  const onBlur = React.useCallback(() => {
    if (!value) {
      setIsFocused(false);
    }
  }, [value]);

  const inputChange: React.ChangeEventHandler<HTMLInputElement> | undefined = (
    e
  ) => {
    setInputValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <Content $background={auth.theme?.token?.colorBgBase}>
      <Input
        onChange={inputChange}
        value={value || inputValue}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled} // 将 disabled 属性传递给 Input
        style={{ cursor: 'default' }} // 添加这行代码
      />
      <Placeholder
        $color={auth.theme?.token?.colorTextPlaceholder}
        className={isFocused || value ? "focused" : ""}
      >
        {placeholder}
      </Placeholder>
    </Content>
  );
};

const Content = styled.div<{
  $background?: string;
}>`
  position: relative;
  .ant-input {
    box-shadow: none;
    font-size: 14px;
    background-color: rgba(25, 26, 27, 0);
  }
  .focused {
    top: -10px;
    left: 12px;
    font-size: 12px;
    // background-color: ${(props) => props.$background};
    background-color: rgba(25, 26, 27, 0);
    padding: 0 6px;
    border-radius: 10px;
    backdrop-filter: blur(100px);
    -webkit-backdrop-filter: blur(100px);
  }
`;

const Placeholder = styled.div<{
  $color?: string;
}>`
  position: absolute;
  left: 18px;
  font-size: 14px;
  top: 14px;
  color: ${(props) => props.$color};
  pointer-events: none;
  transition: all 0.3s ease;
`;

export default observer(BasicInput);
