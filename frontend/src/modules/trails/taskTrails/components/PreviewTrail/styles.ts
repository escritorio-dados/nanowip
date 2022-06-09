import { Box, styled } from '@mui/material';

export const GraphContainer = styled(Box)`
  background: ${({ theme }) => theme.palette.background.paper};
  height: calc(100vh - 12rem);
`;
