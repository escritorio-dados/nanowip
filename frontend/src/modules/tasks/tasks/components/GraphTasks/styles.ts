import { Box, styled } from '@mui/material';

export const PageContainer = styled(Box)`
  width: 100%;
  margin: auto;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;

  > header {
    background: ${({ theme }) => theme.palette.secondary.main};

    min-height: 2rem;
    padding: 0 1rem;

    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
`;

export const GraphContainer = styled(Box)`
  background: ${({ theme }) => theme.palette.background.paper};
  height: 400px;
`;
