import { styled } from '@mui/material';

export const Title = styled('div')`
  cursor: move;

  display: flex;
  align-items: center;
  padding: 0.25rem;
  background: ${({ theme }) => theme.palette.secondary.main};

  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-bottom: 0px;

  h3 {
    flex: 1;
    font-size: 1.25rem;
    margin: 0 0.25rem;
  }
`;

export const Content = styled('div')`
  overflow: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.palette.background.paper};

  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-top: 0px;

  > p {
    margin: 0;
    font-size: 1rem;

    strong {
      color: ${({ theme }) => theme.palette.primary.main};
    }
  }
`;
