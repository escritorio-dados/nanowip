import { styled } from '@mui/material';
import { Box } from '@mui/material';

export const ValueChainCardContainer = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.backgoundAlt};
  display: flex;
  align-items: center;
  min-height: 3rem;
  margin-top: 0.5rem;

  > div.status {
    min-width: 3rem;
    align-self: stretch;
    border-right: 1px solid ${({ theme }) => theme.palette.divider};
    margin-right: 1rem;

    display: flex;

    div {
      flex: 1;

      &.late {
        flex: 0.6;
      }
    }
  }

  > div.expand {
    min-width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const CardActions = styled(Box)`
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  margin-left: 0.5rem;
  border-left: 1px solid ${({ theme }) => theme.palette.divider};

  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;
