import { styled } from '@mui/material';
import { Paper } from '@mui/material';

export const SectionCard = styled(Paper)`
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
      display: flex;
      align-items: center;
    }

    &.actions {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
`;
