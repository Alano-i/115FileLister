import { Select, SelectProps } from "antd";
import * as React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import useStores from "/@/hooks/useStores";
import ArrowIcon from "/@/assets/svg/arrow.svg";

interface Props {
  placeholder?: string | null;
  value?: React.ChangeEvent<HTMLInputElement> | null | undefined;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
  options: SelectProps["options"];
}
const BasicSelect: React.FC<Props> = ({
  placeholder = "",
  value,
  onChange,
  options = [],
}) => {
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<
    React.ChangeEvent<HTMLInputElement> | null | undefined
  >();
  const { auth } = useStores();

  const onFocus = () => setIsFocused(true);

  const onBlur = React.useCallback(() => {
    if (!value) {
      setIsFocused(false);
    }
  }, [value]);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e);
    onChange?.(e);
  };

  const suffixIcon = React.useCallback(() => {
    return (
      <SelectSuffixIcon $isFocus={isFocused}>
        <img className="h-[18px]" src={ArrowIcon} />
      </SelectSuffixIcon>
    );
  }, [isFocused]);

  return (
    <Content $background={auth.theme?.token?.colorBgBase}>
      <Select
        onChange={inputChange}
        value={value || inputValue}
        onBlur={onBlur}
        onFocus={onFocus}
        options={options}
        suffixIcon={suffixIcon()}
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
  .ant-select .ant-select-selector {
    box-shadow: none !important;
  }
  .focused {
    top: -10px;
    left: 12px;
    font-size: 12px;
    background-color: ${(props) => props.$background};
    padding: 0 6px;
    border-radius: 10px;
  }
`;

const Placeholder = styled.div<{
  $color?: string;
}>`
  position: absolute;
  left: 18px;
  top: 14px;
  font-size: 14px;
  color: ${(props) => props.$color};
  pointer-events: none;
  transition: all 0.3s ease;
`;

const SelectSuffixIcon = styled.div<{
  $isFocus: boolean;
}>`
  transform: rotate(${(props) => (props.$isFocus ? 180 : 0)}deg);
  transition: all 0.2s ease;
  opacity: 0.7;
`;

export default observer(BasicSelect);
