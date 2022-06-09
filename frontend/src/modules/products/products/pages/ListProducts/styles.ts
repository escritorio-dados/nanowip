import { Box, styled } from '@mui/material';
import { Paper } from '@mui/material';

export const ListProductContainer = styled(Paper)`
  max-width: 1536px;
  margin: auto;

  border: 2px solid ${({ theme }) => theme.palette.divider};

  border-radius: 5px;
`;

export const ProductList = styled(Box)`
  padding: 1rem;
`;
