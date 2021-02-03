import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: {
        dark: string;
        main: string;
      };
      secondary: {
        dark: string;
        main: string;
      };
      text: {
        main: string;
        light: string;
      };
      background: {
        main: string;
      };
      button: {
        main: string;
        hover: string;
      };
    };
  }
}
