import { styled } from '@mui/material';
import { AppBar, Toolbar } from '@mui/material';

export const AppBarStyled = styled(AppBar)`
  background: ${({ theme }) => theme.palette.secondary.main};
  height: 4rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const ToolbarStyled = styled(Toolbar)`
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MenuHeader = styled('div')`
  color: ${({ theme }) => theme.palette.primary.main};
  padding: 0.7rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const MenuOptions = styled('div')`
  button: {
    display: block;
    width: 100%;
    text-transform: none;
  }
`;
