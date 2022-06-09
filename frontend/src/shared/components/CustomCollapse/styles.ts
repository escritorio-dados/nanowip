import { Box, Collapse, styled } from '@mui/material';

export const CollapseContainer = styled(Box)`
  border: 1px solid ${({ theme }) => theme.palette.divider};

  border-radius: 5px;
`;

export const CollapseHeader = styled(Box)`
  background: ${({ theme }) => theme.palette.secondary.main};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px 5px 0 0;

  min-height: 3rem;
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    padding: 0.5rem 1rem;
  }

  > .title {
    cursor: pointer;
    flex: 1;

    > h2 {
      font-size: 1.2rem;
      font-weight: bold;
    }
  }
`;

export const CollapseBody = styled(Collapse)`
  > div {
    padding: 1rem;
  }
`;
