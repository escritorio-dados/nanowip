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
`;

export const FieldValueContainer = styled('div')`
  display: flex;

  > p,
  strong {
    font-size: 0.9rem;
  }

  strong {
    font-weight: bold;
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
