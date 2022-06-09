import { Box, styled } from '@mui/material';

export const FieldContainer = styled(Box)`
  strong {
    font-weight: bold;
    color: ${({ theme }) => theme.palette.primary.main};
  }

  & + div {
    margin-top: 1rem;
  }
`;

export const TagsContainer = styled(Box)`
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
