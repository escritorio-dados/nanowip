import { Box, styled } from '@mui/material';
import { Paper } from '@mui/material';

export const CostDistributionCard = styled(Paper)`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;

  & + div {
    margin-top: 1rem;
  }
`;

export const GridBox = styled(Box)`
  display: flex;
  padding: 0.5rem;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  height: 100%;
`;

export const Description = styled(Box)`
  padding: 0.5rem;

  border: 1px solid ${({ theme }) => theme.palette.divider};
`;
