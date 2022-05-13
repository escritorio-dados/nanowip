import { styled } from '@mui/material';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  height: calc(100vh - 4rem);
  overflow: auto;

  > main {
    padding: 2rem 1rem;
  }
`;
