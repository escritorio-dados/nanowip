import { Box, styled } from '@mui/material';

export const AssignmentCard = styled(Box)`
  background: ${({ theme }) => theme.palette.backgoundAlt};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;
  width: 100%;

  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    min-height: 3rem;

    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const AssignmentCardInfo = styled(Box)`
  display: flex;
  align-items: center;

  > div.info {
    flex: 1;
    border-right: 1px solid ${({ theme }) => theme.palette.divider};

    > div.deadline {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.3rem;

      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

      > strong {
        color: ${({ theme }) => theme.palette.primary.main};
        font-weight: bold;
        margin-right: 0.5rem;
      }
    }

    > div.stopwatch {
      padding: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;

      > div.timer {
        display: flex;
        align-items: center;
      }

      > div.limit {
        display: flex;
        align-items: center;
        margin-left: 0.3rem;
      }
    }
  }

  > div.actions {
    padding: 0.3rem;
  }
`;
