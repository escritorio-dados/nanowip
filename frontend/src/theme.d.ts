import { Theme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomTheme extends Theme {
    custom: {
      light_background: string;
    };
  }

  // allow configuration using `createTheme`
  interface CustomThemeOptions extends ThemeOptions {
    custom?: {
      light_background?: string;
    };
  }

  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}
