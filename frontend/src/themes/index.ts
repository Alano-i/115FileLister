import { MappingAlgorithm, OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

type ComponentsConfig = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    algorithm?: boolean | MappingAlgorithm | MappingAlgorithm[];
  };
};
export type ConfigThemeType = {
  token: Partial<AliasToken> | undefined;
  components: ComponentsConfig | undefined;
};

interface configType {
  dark: ConfigThemeType; //暗色主题
  light: ConfigThemeType; //白色主题
}

// 主题颜色配置项
export const themeConfig: configType = {
  dark: {
    token: {
      colorPrimary: "#570df8",
      colorInfo: "#570df8",
      colorTextBase: "#ffffff",
      colorBgBase: "#171717",
      fontSize: 16,
      borderRadius: 10,
      colorTextPlaceholder: "rgba(255, 255, 255, 0.5)",

      colorTextTertiary: "#ffffff7f",
    },
    components: {
      Select: {
        controlHeight: 50,
        colorBorder: "rgba(58, 59, 63, 1)",
        colorPrimary: "rgba(143, 142, 147, 1)",
        colorPrimaryHover: "rgba(143, 142, 147, 1)",
        optionActiveBg: "#570df8",
        optionSelectedBg: "#570df8",
        colorBgElevated: "rgba(58, 59, 63, 1)",
        paddingSM: 18,
      },
      Input: {
        controlHeight: 50,
        hoverBorderColor: "rgba(143, 142, 147, 1)",
        activeBorderColor: "rgba(143, 142, 147, 1)",
        colorBorder: "rgba(58, 59, 63, 1)",
        paddingInline: 17,
      },
      InputNumber: {
        controlHeight: 50,
        hoverBorderColor: "rgba(143, 142, 147, 1)",
        activeBorderColor: "rgba(143, 142, 147, 1)",
        colorBorder: "rgba(58, 59, 63, 1)",
        paddingInline: 17,
      },
      Radio: {
        colorBorder: "rgba(132, 135, 138, 0.32)",
      },
      Checkbox: {
        colorBorder: "rgba(132, 135, 138, 0.32)",
      },
      Button: {
        controlHeight: 50,
        colorBorder: "rgba(58, 59, 63, 1)",
        defaultHoverBorderColor: "rgba(143, 142, 147, 1)",
        defaultHoverColor: "#ffffff",
      },
      Modal: {
        colorBgBase: "#202124",
        boxShadow: "0px 10px 30px 0px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  light: {
    token: {
      colorPrimary: "#570df8",
      colorTextBase: "#000000",
      fontSize: 16,
      borderRadius: 10,
      colorTextPlaceholder: "rgba(0, 0, 0, 0.5)",
      colorBgBase: "#ffffff",
      colorTextTertiary: "rgba(0, 0, 0, 0.5)",
    },
    components: {
      Select: {
        controlHeight: 50,
        paddingSM: 18,
      },
      Input: {
        controlHeight: 50,
        paddingInline: 17,
      },
      InputNumber: {
        controlHeight: 50,
        paddingInline: 17,
      },

      Button: {
        controlHeight: 50,
      },
    },
  },
};
