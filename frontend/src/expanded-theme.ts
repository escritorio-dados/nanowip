import '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    backgoundAlt: Palette['divider'];
  }
  interface PaletteOptions {
    backgoundAlt?: PaletteOptions['divider'];
  }
}
