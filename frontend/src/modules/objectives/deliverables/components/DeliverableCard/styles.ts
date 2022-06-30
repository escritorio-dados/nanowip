import { Box, styled } from '@mui/material';

export const DeliverableContainer = styled(Box)`
  min-width: 384px;
  max-width: 384px;

  background-color: ${({ theme }) => theme.palette.backgoundAlt};

  border: 1px solid ${({ theme }) => theme.palette.divider};

  border-radius: 5px;

  margin-bottom: 0.5rem;
`;

export const DeliverableHeader = styled(Box)`
  padding: 0.5rem;
  padding-bottom: 0.3rem;

  /* border-bottom: 1px solid ${({ theme }) => theme.palette.divider}; */
  border-radius: 5px 5px 0 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DeliverableDeadline = styled(Box)`
  display: flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  padding-top: 0;
`;

export const DeliverableProgress = styled(Box)`
  padding: 0.3rem 0.5rem;
  padding-top: 0;
`;
