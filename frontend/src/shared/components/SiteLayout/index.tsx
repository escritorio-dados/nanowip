import { Box, createTheme, ThemeProvider } from '@mui/material';
import { useMemo } from 'react';

import { useKeepStates } from '#shared/hooks/keepStates';
import { useNavBar } from '#shared/hooks/navBar';
import { IColors } from '#shared/pages/CustomizeColors';
import { Router } from '#shared/routes';
import { darkTheme } from '#shared/themes/main.dark.theme';

import { MainContent } from '../MainContent';
import { NavigationBar } from '../NavigationBar';
import { TopAppBar } from '../TopAppBar';
import { SiteContainer } from './styles';

export function SiteLayout() {
  const { openNavBar } = useNavBar();
  const { getState } = useKeepStates();

  const customTheme = useMemo(() => {
    const theme = getState<IColors>({ category: 'tema', key: 'tema', defaultValue: undefined });

    if (!theme) {
      return darkTheme;
    }

    return createTheme({
      ...darkTheme,
      palette: {
        mode: 'dark',
        primary: { main: theme.primary[1] },
        secondary: { main: theme.secondary[1] },
        success: { main: theme.success[1] },
        error: { main: theme.error[1] },
        info: { main: theme.info[1] },
        text: {
          primary: theme.textPrimary[1],
          secondary: theme.textSecondary[1],
        },
        background: {
          default: theme.backgroundDefault[1],
          paper: theme.backgroundPaper[1],
        },
        backgoundAlt: theme.backgroundAlt[1],
        divider: theme.divider[1],
      },
    });
  }, [getState]);

  return (
    <ThemeProvider theme={customTheme}>
      <SiteContainer>
        <NavigationBar />

        <Box
          className="content"
          sx={{
            transition: openNavBar
              ? darkTheme.transitions.create(['margin'], {
                  easing: darkTheme.transitions.easing.sharp,
                  duration: darkTheme.transitions.duration.enteringScreen,
                })
              : darkTheme.transitions.create(['margin'], {
                  easing: darkTheme.transitions.easing.sharp,
                  duration: darkTheme.transitions.duration.leavingScreen,
                }),
            marginLeft: openNavBar ? '240px' : '0px',
          }}
        >
          <TopAppBar />

          <MainContent>
            <Router />
          </MainContent>
        </Box>
      </SiteContainer>
    </ThemeProvider>
  );
}
