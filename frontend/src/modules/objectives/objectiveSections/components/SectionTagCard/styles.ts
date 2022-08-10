import { Box, styled } from '@mui/material';

export const SectionContainer = styled(Box)`
  min-width: 420px;
  max-width: 420px;
  height: 72vh;

  background-color: ${({ theme }) => theme.palette.background.paper};

  border: 1px solid ${({ theme }) => theme.palette.divider};
  margin-right: 1rem;

  border-radius: 5px;
`;

export const SectionHeader = styled(Box)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  padding: 0.5rem;

  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px 5px 0 0;

  height: 3rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DeliverablesContainer = styled(Box)`
  padding: 0.5rem 0;
  height: calc(72vh - 3rem);

  display: flex;
  align-items: center;
  flex-direction: column;

  > div.items {
    overflow: auto;
  }
`;
