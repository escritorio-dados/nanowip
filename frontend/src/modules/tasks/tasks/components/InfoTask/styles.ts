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

export const FieldContainer = styled('div')`
  strong {
    font-weight: bold;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const TagsContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;

  margin-left: 1.5rem;

  > span {
    display: block;
    border-radius: 5px;
    background: ${({ theme }) => theme.palette.backgoundAlt};
    padding: 0.3rem;

    margin-top: 0.5rem;
    margin-left: 0.5rem;
  }
`;
