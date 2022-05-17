import { Menu as IconMenu, Person } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '#shared/hooks/auth';
import { useNavBar } from '#shared/hooks/navBar';
import { useTitle } from '#shared/hooks/title';
import { TextEllipsis } from '#shared/styledComponents/common';
import { darkTheme } from '#shared/themes/main.dark.theme';

import { CustomButton } from '../CustomButton';
import { CustomIconButton } from '../CustomIconButton';
import { CustomPopover } from '../CustomPopover';
import { CustomTooltip } from '../CustomTooltip';
import { AppBarStyled, ToolbarStyled, MenuHeader, MenuOptions } from './styles';

export function TopAppBar() {
  const navigate = useNavigate();
  const { logged, signOut, user } = useAuth();
  const { openNavBar, togleNavBar, closeNavBar } = useNavBar();
  const { title } = useTitle();

  const handleSignOut = useCallback(async () => {
    await signOut();

    closeNavBar();

    navigate('/auth');
  }, [navigate, closeNavBar, signOut]);

  return (
    <AppBarStyled
      position="relative"
      sx={{
        width: '100%',
        transition: openNavBar
          ? darkTheme.transitions.create(['max-width'], {
              easing: darkTheme.transitions.easing.sharp,
              duration: darkTheme.transitions.duration.enteringScreen,
            })
          : darkTheme.transitions.create(['max-width'], {
              easing: darkTheme.transitions.easing.sharp,
              duration: darkTheme.transitions.duration.leavingScreen,
            }),
        maxWidth: openNavBar ? 'calc(100vw - 240px)' : '100vw',
      }}
    >
      <ToolbarStyled>
        {logged && (
          <CustomIconButton
            action={togleNavBar}
            title={openNavBar ? 'Ocultar Menu' : 'Mostrar Menu'}
            type="custom"
            CustomIcon={<IconMenu />}
          />
        )}

        <Box sx={{ maxWidth: '70%' }}>
          <CustomTooltip
            title={title}
            text={<TextEllipsis fontSize="1.3rem">{title}</TextEllipsis>}
          />
        </Box>

        {logged && (
          <CustomPopover help="Usuario" icon={<Person />}>
            <Tooltip title={user.name}>
              <MenuHeader>{user.name}</MenuHeader>
            </Tooltip>

            <MenuOptions>
              <CustomButton
                variant="text"
                margin_type="no-margin"
                color="secondary"
                size="medium"
                onClick={() => navigate('/users/changePassword')}
              >
                Alterar Senha
              </CustomButton>

              <CustomButton
                variant="text"
                margin_type="no-margin"
                color="secondary"
                size="medium"
                onClick={() => navigate('/customize')}
              >
                Customizar (Beta)
              </CustomButton>

              <CustomButton
                variant="text"
                color="secondary"
                size="medium"
                margin_type="no-margin"
                onClick={handleSignOut}
              >
                Sair
              </CustomButton>
            </MenuOptions>
          </CustomPopover>
        )}
      </ToolbarStyled>
    </AppBarStyled>
  );
}
