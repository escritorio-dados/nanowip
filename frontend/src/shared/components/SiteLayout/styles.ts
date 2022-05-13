import { styled } from '@mui/material';
import { Box } from '@mui/material';

export const SiteContainer = styled(Box)`
  min-height: 100vh;
  width: 100vw;
  overflow-x: auto;
  overflow-y: hidden;

  display: flex;

  div.content {
    flex: 1;
  }

  background-color: ${({ theme }) => theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.primary};
`;
