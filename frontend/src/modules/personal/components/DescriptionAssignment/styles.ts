import { styled } from '@mui/material';

export const FieldContainer = styled('div')`
  > strong {
    font-weight: bold;
    width: 100%;
    text-align: center;
    color: ${({ theme }) => theme.palette.primary.main};
  }

  > div.title {
    background-color: ${({ theme }) => theme.palette.secondary.main};
    padding: 0.5rem;

    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: 5px 5px 0 0;

    text-align: center;

    > p {
      font-weight: bold;
    }
  }

  > div.desc {
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-top: 0;

    border-radius: 0 0 5px 5px;
  }
`;
