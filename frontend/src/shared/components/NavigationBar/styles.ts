import { Box, styled } from '@mui/material';

export const NavContainer = styled(Box)`
  width: 240px;
  height: 100%;
  overflow: hidden;

  background: ${({ theme }) => theme.palette.secondary.main};
  border-right: 1px solid ${({ theme }) => theme.palette.divider};

  header {
    display: flex;
    min-height: 4rem;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    align-items: center;
    justify-content: center;

    h1 {
      font-size: 1.5rem;
    }
  }

  nav {
    overflow: auto;
    height: calc(100vh - 4rem);
  }
`;
