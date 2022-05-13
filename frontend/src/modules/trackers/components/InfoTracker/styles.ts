import { styled } from '@mui/material';
import { grey } from '@mui/material/colors';

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

export const FieldContainer = styled('div')`
  margin-top: 1rem;
  margin-bottom: 1rem;

  strong {
    font-weight: bold;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const TagsContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;

  margin-left: 1.5rem;

  max-width: 600px;

  > span {
    display: block;
    border-radius: 5px;
    background: ${grey[600]};
    padding: 0.3rem;

    margin-top: 0.5rem;
    margin-left: 0.5rem;
  }
`;
