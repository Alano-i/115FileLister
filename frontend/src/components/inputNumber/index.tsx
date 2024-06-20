import { InputNumber } from "antd";
import * as React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";

interface Props {
  placeholder?: string | null;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
  value?: number | null;
  onChange?: (value: number | null) => void;
}
const BasicInputNumber: React.FC<Props> = ({
  placeholder,
  controls,
  value,
  onChange,
}) => {
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<number | null>(
    value ?? null
  );
  const { auth } = useStores();

  const onFocus = () => setIsFocused(true);

  const onBlur = React.useCallback(() => {
    if (!value) {
      setIsFocused(false);
    }
  }, [value]);

  const inputChange = (val: number | null) => {
    setInputValue(val);
    onChange?.(val);
  };

  return (
    <Content $background={auth.theme?.token?.colorBgBase}>
      <InputNumber
        onChange={inputChange}
        value={value || inputValue}
        onBlur={onBlur}
        onFocus={onFocus}
        className="w-full"
        controls={controls}
      />
      <Placeholder
        $color={auth.theme?.token?.colorTextPlaceholder}
        className={isFocused || value || value === 0 ? "focused" : ""}
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
  .ant-input-number {
    box-shadow: none;
    font-size: 14px;
    background-color: #88888800;
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

export default observer(BasicInputNumber);
