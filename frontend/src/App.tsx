import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as DateAdapter } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

      <DndProvider backend={HTML5Backend}>
        <AppProvider>
          <BrowserRouter>
            <LocalizationProvider dateAdapter={DateAdapter} adapterLocale={ptBR}>
              <SiteLayout />
            </LocalizationProvider>
          </BrowserRouter>
        </AppProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
