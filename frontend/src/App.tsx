import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as DateAdapter } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { BrowserRouter } from 'react-router-dom';

import { SiteLayout } from '#shared/components/SiteLayout';
import { AppProvider } from '#shared/hooks';
import { cssGlobal } from '#shared/themes/global.styles';
import { darkTheme } from '#shared/themes/main.dark.theme';

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <GlobalStyles styles={cssGlobal} />

      <AppProvider>
        <BrowserRouter>
          <LocalizationProvider dateAdapter={DateAdapter} adapterLocale={ptBR}>
            <SiteLayout />
          </LocalizationProvider>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
