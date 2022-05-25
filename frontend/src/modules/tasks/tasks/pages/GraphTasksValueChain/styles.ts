import { styled } from '@mui/material';

export const PageContainer = styled('div')`
  max-width: 1536px;
  width: 100%;
  margin: auto;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;

  > header {
    background: ${({ theme }) => theme.palette.secondary.main};

    border-radius: 5px 5px 0 0;

    min-height: 4rem;
    padding: 0.5rem 1rem;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export const GraphContainer = styled('div')`
  background: ${({ theme }) => theme.palette.background.paper};
  height: calc(100vh - 12rem);
`;
