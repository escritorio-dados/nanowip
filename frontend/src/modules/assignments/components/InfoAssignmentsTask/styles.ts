import { styled } from '@mui/material';
import { Paper } from '@mui/material';

export const AssignmentCard = styled(Paper)`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;

  & + div {
    margin-top: 1rem;
  }

  > div {
    padding: 0.5rem 1rem;

    &.info {
      flex: 1;
      border-right: 1px solid ${({ theme }) => theme.palette.divider};
    }

    &.actions {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
`;

export const FieldValueContainer = styled('div')`
  display: flex;

  & + div {
    margin-top: 1rem;
  }

  > p,
  strong {
    font-size: 0.8rem;
  }

  strong {
    font-weight: bold;
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
