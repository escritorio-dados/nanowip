import { Box, styled } from '@mui/material';
import { Badge, Collapse } from '@mui/material';

export const HeaderContainer = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const HeaderActions = styled(Box)`
  background: ${({ theme }) => theme.palette.secondary.main};
  border-radius: 5px 5px 0 0;

  min-height: 4rem;
  padding: 0.5rem 1rem;
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderFilter = styled(Collapse)`
  > div {
    padding: 1rem;
  }
`;

export const FooterContainer = styled(Box)`
  background: ${({ theme }) => theme.palette.secondary.main};
  min-height: 4rem;
  padding: 1rem;

  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 0 0 5px 5px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ActiveFiltersNumber = styled(Badge)`
  & .MuiBadge-badge {
    right: 6px;
    top: 10px;
    padding: 0 4px;
  }
`;
