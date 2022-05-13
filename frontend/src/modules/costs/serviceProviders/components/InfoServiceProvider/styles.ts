import { styled } from '@mui/material';

export const FieldValueContainer = styled('div')`
  display: flex;

  & + div {
    margin-top: 1rem;
  }

  strong {
    font-weight: bold;
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
