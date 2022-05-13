import { styled } from '@mui/material';
import { Box } from '@mui/material';

export const SubProductContainer = styled(Box)`
  margin: 0 3rem;

  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.backgoundAlt};
  display: flex;
  align-items: center;
  min-height: 3rem;

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
`;

export const CardActions = styled('div')`
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  margin-left: 0.5rem;
  border-left: 1px solid ${({ theme }) => theme.palette.divider};

  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;
