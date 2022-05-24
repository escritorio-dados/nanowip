import { Box, Grid, styled } from '@mui/material';
import { Paper } from '@mui/material';

export const ListProductContainer = styled(Paper)`
  max-width: 1536px;
  margin: auto;

  border: 2px solid ${({ theme }) => theme.palette.divider};

  border-radius: 5px;
`;

export const ProductList = styled(Box)`
  padding: 1rem;

  > div + div {
    margin-top: 1rem;
  }
`;

export const ProductCardData = styled(Box)`
  border-radius: 5px;
`;

export const ProductTitle = styled(Box)`
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.palette.secondary.main};

  border: 1px solid ${({ theme }) => theme.palette.divider};

  border-radius: 5px 5px 0 0;
`;

export const SubproductTitle = styled(Box)`
  height: 100%;
  padding: 0.2rem 0.5rem;

  display: flex;
  align-items: center;

  cursor: pointer;

  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const ValueChainTitle = styled(Box)`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.5rem;

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const TaskField = styled(Box)`
  height: 100%;
  padding: 0.2rem 0.5rem;

  display: flex;
  align-items: center;

  border-left: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const SubproductDataRow = styled(Grid)`
  margin-top: 0.3rem;

  &:first-of-type {
    margin-top: 0;
  }

  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const ValueChainRows = styled(Box)`
  border-left: 1px solid ${({ theme }) => theme.palette.divider};

  display: flex;
  flex-direction: column;
  height: 100%;

  > div + div {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const TaskData = styled(Grid)`
  flex: 1;

  & + div {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;
