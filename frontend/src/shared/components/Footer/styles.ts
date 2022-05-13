import { styled } from '@mui/material';

export const FooterContainer = styled('footer')`
  height: 4rem;
  width: 100%;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};

  background-color: ${({ theme }) => theme.palette.secondary.main};
`;
