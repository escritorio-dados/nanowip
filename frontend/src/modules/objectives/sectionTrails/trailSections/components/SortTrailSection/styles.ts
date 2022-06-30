import { Box, styled } from '@mui/material';

export const SortItem = styled(Box)`
  cursor: grab;

  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;

  margin-top: 0.3rem;

  background-color: ${({ theme }) => theme.palette.secondary.main};
`;
